import { createClient } from "@/lib/supabase/server"
import { DollarSign } from "lucide-react"
import type { Order, OrderItem } from "@/types/database"
import { OrderCard } from "@/components/admin/order-card"

export const revalidate = 0

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Solo órdenes entregadas (delivered) para el historial de ventas
  const { data: raw } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })

  // Para el total facturado sumamos paid + delivered (ingreso real)
  const { data: allIncome } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['paid', 'delivered'])

  const deliveredOrders = (raw as unknown as OrderWithItems[]) || []
  const totalRevenue = (allIncome as unknown as { total_amount: number }[])?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">

      {/* Header */}
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-40 border-b border-[#DBC8B6] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723]">Ventas</h1>
          <p className="text-[#A87B6A] text-sm font-bold mt-0.5 uppercase tracking-wider">Historial Entregadas</p>
        </div>
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-8">

        {/* Métricas rápidas */}
        <div className="p-5 rounded-[24px] bg-[#C25E3B] text-[#FFF9EE] flex justify-between items-center shadow-[0_8px_30px_rgba(194,94,59,0.25)] overflow-hidden relative">
          <div className="absolute top-0 right-0 -m-4 w-28 h-28 bg-[#D48C5C] rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="z-10">
            <span className="text-sm font-black uppercase tracking-widest text-[#FFF9EE]/70">Total Facturado</span>
            <p className="text-4xl font-extrabold tracking-tighter mt-1">${totalRevenue.toLocaleString('es-AR')}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#FFF9EE]/20 flex items-center justify-center z-10 shrink-0">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Historial de Entregas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#3E2723] tracking-tight uppercase">Entregadas ({deliveredOrders.length})</h2>
          </div>

          <div className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-[#A87B6A] opacity-60">
                <p className="font-bold text-xs uppercase tracking-widest">Sin ventas registradas</p>
              </div>
            ) : (
              deliveredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showActions={false} // Solo lectura
                />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
