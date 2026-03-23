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

  return (
    <AnimatePresence>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onDelivered={handleDelivered}
        />
      ))}
    </AnimatePresence>
  )
}
