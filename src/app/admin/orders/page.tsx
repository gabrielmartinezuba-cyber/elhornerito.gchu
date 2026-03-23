import { createClient } from "@/lib/supabase/server"
import { DollarSign, ShoppingCart } from "lucide-react"
import type { Order, OrderItem } from "@/types/database"

export const revalidate = 0

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

// Importamos el OrderCard en un client wrapper
import { OrdersHistoryClient } from "@/components/admin/orders-history-client"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  const orders = (raw as unknown as OrderWithItems[]) || []

  const paid    = orders.filter(o => o.status === 'paid')
  const delivered = orders.filter(o => o.status === 'delivered')

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, o) => acc + Number(o.total_amount), 0)

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">

      {/* Header */}
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-40 border-b border-[#DBC8B6] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723]">Ventas</h1>
          <p className="text-[#A87B6A] text-sm font-bold mt-0.5 uppercase tracking-wider">Historial completo</p>
        </div>
        <div className="w-24 h-24 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-8">

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 p-5 rounded-[24px] bg-[#C25E3B] text-[#FFF9EE] flex justify-between items-center shadow-[0_8px_30px_rgba(194,94,59,0.25)] overflow-hidden relative">
            <div className="absolute top-0 right-0 -m-4 w-28 h-28 bg-[#D48C5C] rounded-full opacity-40 blur-2xl pointer-events-none" />
            <div className="z-10">
              <span className="text-sm font-black uppercase tracking-widest text-[#FFF9EE]/70">Total Facturado</span>
              <p className="text-4xl font-extrabold tracking-tighter mt-1">${totalRevenue.toLocaleString('es-AR')}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#FFF9EE]/20 flex items-center justify-center z-10 shrink-0">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-[#FFF9EE] border border-[#DBC8B6] shadow-sm flex flex-col gap-1">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 w-fit mb-2"><ShoppingCart className="w-5 h-5" /></div>
            <p className="text-3xl font-black text-[#3E2723]">{paid.length}</p>
            <p className="text-[11px] font-black text-[#8A3A25] uppercase tracking-widest">Activas</p>
          </div>

          <div className="p-5 rounded-[24px] bg-[#FFF9EE] border border-[#DBC8B6] shadow-sm flex flex-col gap-1">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 w-fit mb-2"><ShoppingCart className="w-5 h-5" /></div>
            <p className="text-3xl font-black text-[#3E2723]">{delivered.length}</p>
            <p className="text-[11px] font-black text-[#8A3A25] uppercase tracking-widest">Entregadas</p>
          </div>
        </div>

        {/* Lista de órdenes */}
        <OrdersHistoryClient paidOrders={paid} deliveredOrders={delivered} />

      </div>
    </div>
  )
}
