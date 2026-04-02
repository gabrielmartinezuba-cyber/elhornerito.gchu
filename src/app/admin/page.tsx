import { createClient } from "@/lib/supabase/server"
import { Package } from "lucide-react"
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
    .neq('status', 'delivered')
    .order('created_at', { ascending: false })

  const activeOrders = (activeOrdersRaw as unknown as OrderWithItems[]) || []
  const activeCount = activeOrders.length

  // Fecha formateada
  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">
      
      {/* Header */}
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-40 border-b border-[#DBC8B6] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723] drop-shadow-sm">Órdenes Activas</h1>
          <p className="text-[#A87B6A] text-sm font-bold mt-1 uppercase tracking-wider">Hoy, {today}</p>
        </div>
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-8">

        {/* ─── Órdenes Activas ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#3E2723] tracking-tight">Pendientes de Entrega</h3>
            {activeCount > 0 && (
              <span className="text-[10px] font-black text-[#FFF9EE] uppercase tracking-wider bg-[#C25E3B] px-3 py-1.5 rounded-full shadow-sm">
                {activeCount} {activeCount !== 1 ? "órdenes" : "orden"}
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
