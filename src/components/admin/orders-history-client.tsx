"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { PackageOpen } from "lucide-react"
import { OrderCard } from "@/components/admin/order-card"
import type { Order, OrderItem } from "@/types/database"

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

interface Props {
  paidOrders: OrderWithItems[]
  deliveredOrders: OrderWithItems[]
}

export function OrdersHistoryClient({ paidOrders, deliveredOrders }: Props) {
  const [paid, setPaid] = useState<OrderWithItems[]>(paidOrders)

  const handleDelivered = (orderId: string) => {
    // Eliminamos optimísticamente de la lista de activas
    // El revalidatePath del server action actualizará el RSC en background
    setPaid(prev => prev.filter(o => o.id !== orderId))
  }

  return (
    <div className="space-y-8">

      {/* ACTIVAS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#3E2723] tracking-tight uppercase">Activas</h2>
          {paid.length > 0 && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
              {paid.length} pendiente{paid.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {paid.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-[#A87B6A] opacity-60">
            <PackageOpen className="w-10 h-10 mb-2" />
            <p className="font-bold text-xs uppercase tracking-widest">Sin órdenes activas</p>
          </div>
        ) : (
          <AnimatePresence>
            {paid.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                showActions={true}
                onDelivered={handleDelivered}
              />
            ))}
          </AnimatePresence>
        )}
      </section>

      {/* ENTREGADAS */}
      {deliveredOrders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#3E2723] tracking-tight uppercase">Entregadas</h2>
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              {deliveredOrders.length} total
            </span>
          </div>
          <div className="space-y-3">
            {deliveredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                showActions={false}  // sin botones de acción
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
