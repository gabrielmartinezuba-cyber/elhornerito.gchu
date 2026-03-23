import { createClient } from "@/lib/supabase/server"
import { DollarSign, Package, Users } from "lucide-react"
import { Order, OrderItem } from "@/types/database"
import { ActiveOrdersList } from "@/components/admin/active-orders-list"

export const revalidate = 0

type OrderWithItems = Order & { order_items: (OrderItem & { product_name: string })[] }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Órdenes activas (paid) para gestión
  const { data: activeOrdersRaw } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  // Métricas: suma de paid + delivered
  const { data: allOrdersRaw } = await supabase
    .from('orders')
    .select('total_amount, status')
    .in('status', ['paid', 'delivered'])

  const { data: productsRaw } = await supabase
    .from('products')
    .select('id')

  const activeOrders = (activeOrdersRaw as unknown as OrderWithItems[]) || []
  const allOrders = (allOrdersRaw as unknown as { total_amount: number; status: string }[]) || []

  const totalIncome = allOrders.reduce((acc, o) => acc + Number(o.total_amount), 0)
  const activeCount = activeOrders.length
  const totalProducts = productsRaw?.length ?? 0

  // Fecha formateada
  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  const metrics = [
    { id: 1, label: "Órdenes Activas", value: activeCount.toString(), icon: Package },
    { id: 2, label: "Productos", value: totalProducts.toString(), icon: Users },
  ]

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">
      
      {/* Header */}
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-40 border-b border-[#DBC8B6] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723] drop-shadow-sm">Panel de Control</h1>
          <p className="text-[#A87B6A] text-sm font-bold mt-1 uppercase tracking-wider">Hoy, {today}</p>
        </div>
        <div className="w-24 h-24 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-8">

        {/* ─── Métricas ─── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Ingreso Bruto */}
          <div className="col-span-2 p-5 rounded-[24px] bg-[#C25E3B] text-[#FFF9EE] flex justify-between items-center shadow-[0_8px_30px_rgba(194,94,59,0.25)] overflow-hidden relative active:scale-95 transition-transform cursor-default">
            <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-[#D48C5C] rounded-full opacity-40 blur-2xl pointer-events-none" />
            <div className="space-y-1 z-10 flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest text-[#FFF9EE]/70">Ingreso Bruto</span>
              <span className="text-4xl font-extrabold tracking-tighter">
                ${totalIncome.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#FFF9EE]/20 flex items-center justify-center backdrop-blur-sm z-10 shrink-0">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>

          {metrics.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-[24px] bg-[#FFF9EE] border border-[#DBC8B6] shadow-[0_4px_15px_rgba(62,39,35,0.04)] flex flex-col justify-between cursor-default active:scale-95 transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#EAE2D0] rounded-xl text-[#8A3A25] shadow-sm">
                  <m.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-[#3E2723] mb-1">{m.value}</h3>
                <p className="text-[11px] font-black text-[#8A3A25] uppercase tracking-widest">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Órdenes Activas ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#3E2723] tracking-tight">Órdenes Activas</h3>
            {activeCount > 0 && (
              <span className="text-[10px] font-black text-[#FFF9EE] uppercase tracking-wider bg-[#C25E3B] px-3 py-1.5 rounded-full shadow-sm">
                {activeCount} pendiente{activeCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <ActiveOrdersList initialOrders={activeOrders} />
          </div>
        </div>

      </div>
    </div>
  )
}
