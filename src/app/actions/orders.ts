"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { sendNotificationToAdmins } from "./webpush"
import type { CartItem } from "@/store/cartStore"

interface PlaceOrderPayload {
  customerName: string
  customerPhone: string
  items: CartItem[]
  total: number
  paymentMethod: string
  paymentStatus: string
  shippingCost: number
  deliveryMethod: string
}

export interface PlaceOrderResult {
  success: boolean
  orderId?: string
  error?: string
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
  const { customerName, customerPhone, items, total, paymentMethod, paymentStatus, shippingCost, deliveryMethod } = payload

  if (!customerName.trim() || !customerPhone.trim()) {
    return { success: false, error: "Nombre y teléfono son obligatorios." }
  }
  if (items.length === 0) {
    return { success: false, error: "El carrito está vacío." }
  }

  const supabase = await createClient()

  // 1. Validar Stock antes de proceder
  const productIds = items.map(item => item.product.id)
  const { data: dbProducts, error: stockCheckError } = await supabase
    .from('products')
    .select('id, name, stock_quantity, category')
    .in('id', productIds)

  if (stockCheckError) {
    return { success: false, error: "Error al verificar el stock disponible." }
  }

  for (const item of items) {
    const dbProduct = dbProducts?.find(p => p.id === item.product.id)
    if (!dbProduct) {
      return { success: false, error: `El producto ${item.product.name} ya no existe.` }
    }
    
    // EXCEPCIÓN: Los productos 'a_pedido' tienen stock infinito lógico
    const isAPedido = dbProduct.category === 'a_pedido'
    if (!isAPedido && dbProduct.stock_quantity < item.quantity) {
      return { 
        success: false, 
        error: `Stock insuficiente para ${item.product.name}. Disponible: ${dbProduct.stock_quantity}` 
      }
    }
  }

  // 2. Insertar la orden principal
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: '',
      total_amount: total,
      status: 'pending' as const, // Todas las órdenes nuevas entran como pendientes de entrega
      payment_method: paymentMethod,
      payment_status: 'pending', // Por defecto no están pagadas (Fase 19)
      shipping_cost: deliveryMethod === 'pickup' ? 0 : shippingCost,
      delivery_method: deliveryMethod,
      mp_preference_id: null,
      mp_payment_id: null,
      mp_merchant_order_id: null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: `Error al crear la orden: ${orderError?.message}` }
  }

  // 3. Insertar los order_items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // Rollback: eliminar la orden huérfana
    await supabase.from('orders').delete().eq('id', order.id)
    return { success: false, error: `Error al guardar productos: ${itemsError.message}` }
  }

  // 4. Descontar stock (excepto a_pedido)
  for (const item of items) {
    const dbProduct = dbProducts?.find(p => p.id === item.product.id)
    if (dbProduct?.category === 'a_pedido') continue

    const { error: stockUpdateError } = await supabase.rpc('decrement_stock', {
      row_id: item.product.id,
      quantity_to_remove: item.quantity
    })

    // Si el RPC no existe, usamos update normal
    if (stockUpdateError) {
      const newStock = (dbProduct?.stock_quantity ?? 0) - item.quantity
      await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          in_stock: newStock > 0 
        })
        .eq('id', item.product.id)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/') // Revalidar el storefront para el stock

  // Enviar notificación a los administradores
  await sendNotificationToAdmins({
    title: "¡Nuevo Pedido en El Hornerito!",
    body: `Nuevo pedido de ${customerName.trim()} por $${total.toLocaleString('es-AR')} (${paymentMethod === 'cash' ? 'Efectivo/Transferencia' : paymentMethod})`
  }).catch(e => console.error("Push failed inside placeOrder", e))

  return { success: true, orderId: order.id }
}

export async function markOrderDelivered(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'delivered' as const,
      payment_status: 'paid' // Sincronización logística/financiera (Fase 15.1)
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true }
}

export async function markOrderPaid(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: 'paid' 
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true }
}

export async function confirmMPOrder(orderId: string, paymentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'paid' as const,
      payment_status: 'paid',
      mp_payment_id: paymentId
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true }
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Obtener items de la orden para saber qué devolver
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)

    if (itemsError) throw new Error("No se pudieron obtener los productos de la orden.")

    // 2. Devolver stock a cada producto
    if (items && items.length > 0) {
      for (const item of items) {
        // Obtenemos stock actual (esto podría fallar en condiciones de carrera pesadas, 
        // pero para este alcance es aceptable o usaríamos una función RPC)
        const { data: prod } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (prod) {
          const newStock = Number(prod.stock_quantity) + Number(item.quantity)
          await supabase
            .from('products')
            .update({ 
              stock_quantity: newStock,
              in_stock: true 
            })
            .eq('id', item.product_id)
        }
      }
    }

    // 3. Eliminar la orden (order_items se eliminan por On Delete Cascade si está configurado, 
    // pero lo hacemos manual por seguridad si no lo está)
    await supabase.from('order_items').delete().eq('order_id', orderId)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteError) throw new Error(deleteError.message)

    revalidatePath('/admin')
    revalidatePath('/') 
    revalidatePath('/admin/orders')

    return { success: true }
  } catch (err: any) {
    console.error("CancelOrder Error:", err)
    return { success: false, error: err.message || "Error al cancelar la orden." }
  }
}

export async function getOrder(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()
  
  if (error) return { success: false, error: error.message }
  return { success: true, order: data }
}

