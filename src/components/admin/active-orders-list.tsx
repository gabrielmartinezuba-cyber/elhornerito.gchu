"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PackageOpen } from "lucide-react"
import { OrderCard } from "@/components/admin/order-card"
import { Order, OrderItem } from "@/types/database"

type OrderWithItems = Order & { order_items: (OrderItem & { product_name: string })[] }

interface ActiveOrdersListProps {
  initialOrders: OrderWithItems[]
}

export function ActiveOrdersList({ initialOrders }: ActiveOrdersListProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders)

  const handleDelivered = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  if (orders.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-[#A87B6A] opacity-60">
        <PackageOpen className="w-12 h-12 mb-3" />
        <p className="font-bold text-sm tracking-widest uppercase">Sin órdenes activas</p>
      </div>
    )
  }

  const stockOrders = orders.filter(o => o.order_type === 'stock')
  const preorderOrders = orders.filter(o => o.order_type === 'preorder')

  const renderColumn = (title: string, columnOrders: OrderWithItems[]) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#DBC8B6]">
        <h4 className="font-black text-[#3E2723] text-sm uppercase tracking-wider">{title}</h4>
        <span className="text-[10px] font-black text-[#FFF9EE] bg-[#A87B6A] px-2 py-0.5 rounded-full shadow-sm">{columnOrders.length}</span>
      </div>
      <AnimatePresence>
        {columnOrders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 flex flex-col items-center opacity-50">
             <PackageOpen className="w-8 h-8 mb-2 text-[#A87B6A]" />
             <p className="text-[10px] font-bold uppercase tracking-wider text-[#A87B6A]">Vacío</p>
          </motion.div>
        ) : (
          columnOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onDelivered={handleDelivered}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {renderColumn("En Stock", stockOrders)}
      {renderColumn("A Pedido", preorderOrders)}
    </div>
  )
}
