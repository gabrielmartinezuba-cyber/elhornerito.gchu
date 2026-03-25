"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingBag, PartyPopper, Home, Cookie, Utensils } from "lucide-react"

export default function StorefrontNav() {
  const pathname = usePathname()

  const items = [
    { label: "Inicio", href: "/", icon: Home },
    { label: "Cotiza tu evento", href: "/cotizacion", icon: PartyPopper },
  ]

  return (
    <div className="fixed bottom-0 max-w-md w-full left-1/2 -translate-x-1/2 bg-[#FFF9EE]/95 backdrop-blur-xl border-t border-[#DBC8B6] h-[64px] pb-safe flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(62,39,35,0.08)] flex-nowrap">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 px-0.5 min-w-0">
            <motion.div whileTap={{ scale: 0.88 }} className={`flex flex-col items-center gap-0.5 ${isActive ? "text-[#C25E3B]" : "text-[#A87B6A]"}`}>
              <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-[#C25E3B]/10" : ""}`}>
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight leading-none whitespace-nowrap">{label}</span>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}
