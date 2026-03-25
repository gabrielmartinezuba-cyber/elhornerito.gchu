"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Package, ShoppingCart, Settings } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: "Productos", href: "/admin/products", icon: Package },
    { label: "Órdenes", href: "/admin", icon: LayoutDashboard },
    { label: "Ventas", href: "/admin/orders", icon: ShoppingCart },
    { label: "Config", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-[#FFF9EE]/90 backdrop-blur-xl border-t border-[#DBC8B6] h-[64px] pb-safe flex items-center justify-around z-50 shadow-[0_-5px_20px_rgba(62,39,35,0.05)] flex-nowrap">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link href={item.href} key={item.href} className="flex-1 h-full touch-none group flex flex-col items-center justify-center min-w-0 px-0.5">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className={cn("flex flex-col items-center justify-center w-full h-full gap-0.5", isActive ? "text-[#C25E3B]" : "text-[#A87B6A]")}
            >
              <div className={cn("relative p-1 rounded-xl transition-all", isActive && "bg-[#C25E3B]/10 shadow-[inset_0_1px_3px_rgba(194,94,59,0.2)]")}>
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "fill-[#C25E3B]/20" : "")} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-black tracking-tight uppercase leading-none whitespace-nowrap">{item.label}</span>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}
