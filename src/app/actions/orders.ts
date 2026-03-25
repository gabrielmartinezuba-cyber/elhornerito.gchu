"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { CartItem } from "@/store/cartStore"

interface PlaceOrderPayload {
  customerName: string
  customerPhone: string
  items: CartItem[]
  total: number
}

export interface PlaceOrderResult {
  success: boolean
  orderId?: string
  error?: string
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
  const { customerName, customerPhone, items, total } = payload

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
    .select('id, name, stock_quantity')
    .in('id', productIds)

  if (stockCheckError) {
    return { success: false, error: "Error al verificar el stock disponible." }
  }

  for (const item of items) {
    const dbProduct = dbProducts?.find(p => p.id === item.product.id)
    if (!dbProduct) {
      return { success: false, error: `El producto ${item.product.name} ya no existe.` }
    }
    if (dbProduct.stock_quantity < item.quantity) {
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
      status: 'paid' as const,
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

  // 4. Descontar stock
  // Lo hacemos secuencialmente para asegurar que cada uno se procese
  for (const item of items) {
    const { error: stockUpdateError } = await supabase.rpc('decrement_stock', {
      row_id: item.product.id,
      quantity_to_remove: item.quantity
    })

    // Si el RPC no existe, usamos update normal
    if (stockUpdateError) {
      const dbProduct = dbProducts?.find(p => p.id === item.product.id)
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

  return { success: true, orderId: order.id }
}

export async function markOrderDelivered(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'delivered' as const })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true }
}
