import { createClient } from "@/lib/supabase/server"
import type { Order, OrderItem } from "@/types/database"
import { SalesHistoryClient } from "@/components/admin/sales-history-client"

export const revalidate = 0

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // 1. Obtener TODAS las órdenes entregadas (entregadas = history)
  const { data: raw } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })

  // 2. Para el total facturado sumamos paid + delivered (ingreso real)
  const { data: allIncome } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['paid', 'delivered'])

  const deliveredOrders = (raw as unknown as OrderWithItems[]) || []
  const totalRevenue = (allIncome as unknown as { total_amount: number }[])?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">

      {/* Header Fijo */}
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-40 border-b border-[#DBC8B6] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723]">Ventas</h1>
          <p className="text-[#A87B6A] text-sm font-bold mt-0.5 uppercase tracking-wider">Historial Entregadas</p>
        </div>
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>

      {/* Lógica de cliente interactiva */}
      <SalesHistoryClient 
        initialDeliveredOrders={deliveredOrders} 
        overallTotalRevenue={totalRevenue} 
      />
    </div>
  )
}
