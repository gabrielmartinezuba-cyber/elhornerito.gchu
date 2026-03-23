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

  // 1. Insertar la orden principal
  const { data: order, error: orderError } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: '',
      total_amount: total,
      status: 'paid',
      mp_preference_id: null,
      mp_payment_id: null,
      mp_merchant_order_id: null,
    } as any)
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: `Error al crear la orden: ${orderError?.message}` }
  }

  const orderId = (order as unknown as { id: string }).id

  // 2. Insertar los order_items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(orderItems as any)

  if (itemsError) {
    // Rollback: eliminar la orden huérfana
    await supabase.from('orders').delete().eq('id', orderId)
    return { success: false, error: `Error al guardar productos: ${itemsError.message}` }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true, orderId }
}

export async function markOrderDelivered(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ status: 'delivered' } as any)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')

  return { success: true }
}
