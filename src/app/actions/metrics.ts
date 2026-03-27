"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDetailedMetrics(fromDate: string, toDate: string) {
  const supabase = await createClient()

  // 1. Obtener Items vendidos agrupados y sumados
  // Nota: Supabase query simple no soporta fácilmente SUM sobre una unión.
  // Usamos una consulta cruda o múltiples filtrados.
  
  const { data: items, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      product_id,
      product_name,
      orders!inner(created_at, payment_status)
    `)
    .gte('orders.created_at', fromDate)
    .lte('orders.created_at', toDate)
    .or('payment_status.eq.approved,payment_status.eq.paid', { foreignTable: 'orders' })

  if (error) {
    console.error("Error fetching metrics:", error)
    return { success: false, data: [] }
  }

  // 2. Agrupar por producto
  const grouped = (items || []).reduce((acc: any, item: any) => {
    const pid = item.product_id
    if (!acc[pid]) {
      acc[pid] = {
        id: pid,
        name: item.product_name,
        totalQuantity: 0,
        totalRevenue: 0
      }
    }
    acc[pid].totalQuantity += item.quantity
    acc[pid].totalRevenue += (item.quantity * item.unit_price)
    return acc
  }, {})

  const ranking = Object.values(grouped).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)

  return { success: true, data: ranking }
}

export async function getStockMetrics() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_quantity, image_url, image_urls, category')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })

  if (error) {
    console.error("Error fetching stock metrics:", error)
    return { success: false, data: [] }
  }

  return { success: true, data }
}
