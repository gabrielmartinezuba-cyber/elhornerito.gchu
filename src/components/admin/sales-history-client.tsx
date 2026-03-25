"use client"

import { useState } from "react"
import { DollarSign, Calendar, ShoppingBag } from "lucide-react"
import type { Order, OrderItem } from "@/types/database"
import { OrderCard } from "@/components/admin/order-card"

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

interface Props {
  initialDeliveredOrders: OrderWithItems[]
  overallTotalRevenue: number
}

export function SalesHistoryClient({ initialDeliveredOrders, overallTotalRevenue }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0] // Provee "YYYY-MM-DD" para input[type=date]
  })

  // Filtrar en el cliente (estricto por el día local)
  const filteredOrders = initialDeliveredOrders.filter(order => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate === selectedDate
  })

  const dailyTotal = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-8">

      {/* Selector de Fecha Estilizado */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] ml-1 flex items-center gap-2">
           <Calendar className="w-3.5 h-3.5" />
           Filtrar Ventas por Día
        </label>
        <div className="relative">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-[60px] px-5 bg-[#FFF9EE] border border-[#DBC8B6] rounded-[20px] text-[16px] text-[#3E2723] font-black focus:border-[#C25E3B] focus:bg-white outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Métricas filtradas del día */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-[24px] bg-[#C25E3B] text-[#FFF9EE] shadow-[0_8px_25px_rgba(194,94,59,0.2)] flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF9EE]/70">Recaudado (Día)</span>
          <p className="text-2xl font-black tracking-tighter mt-1">${dailyTotal.toLocaleString('es-AR')}</p>
        </div>
        <div className="p-5 rounded-[24px] bg-[#FFF9EE] border border-[#DBC8B6] text-[#3E2723] shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A87B6A]">Entregas (Día)</span>
          <div className="flex items-center gap-2 mt-1">
            <ShoppingBag className="w-4 h-4 text-[#C25E3B]" />
            <p className="text-2xl font-black tracking-tighter">{filteredOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Total Acumulado Histórico */}
      <div className="p-6 rounded-[24px] bg-[#3E2723] text-[#FFF9EE] flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Total Facturado Acumulado</span>
          <p className="text-3xl font-black tracking-tight mt-1">${overallTotalRevenue.toLocaleString('es-AR')}</p>
        </div>
        <DollarSign className="w-8 h-8 text-[#C25E3B]" />
      </div>

      {/* Lista de Entregas del Día */}
      <section className="space-y-4">
        <h2 className="text-base font-black text-[#3E2723] tracking-tight uppercase">
          Ventas del {selectedDate.split('-').reverse().join('/')}
        </h2>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-[#DBC8B6] rounded-[24px] flex flex-col items-center justify-center text-[#A87B6A] opacity-60">
              <ShoppingBag className="w-10 h-10 mb-2 opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest text-center">No hubo ventas <br /> en esta fecha</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                showActions={false}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
