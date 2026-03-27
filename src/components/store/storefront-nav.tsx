"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingBag, PartyPopper, Home, Snowflake, Store, MessageCircle } from "lucide-react"

export default function StorefrontNav() {
  const pathname = usePathname()

  const items = [
    { label: "Panadería", href: "/", icon: Store },
    { label: "Congelados", href: "/congelados", icon: Snowflake },
    { label: "Cotiza", href: "/cotizacion", icon: PartyPopper },
  ]

  return (
    <div className="fixed bottom-0 max-w-md w-full left-1/2 -translate-x-1/2 bg-[#FFF9EE]/95 backdrop-blur-xl border-t border-[#DBC8B6] h-[66px] pb-safe flex items-center justify-around z-40 shadow-[0_-4px_24px_rgba(62,39,35,0.12)] px-2">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 min-w-0 transition-opacity active:opacity-60">
            <motion.div whileTap={{ scale: 0.85 }} className={`flex flex-col items-center gap-0.5 ${isActive ? "text-[#C25E3B]" : "text-[#A87B6A]"}`}>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-[#C25E3B]/10 shadow-[inset_0_0_10px_rgba(194,94,59,0.05)]" : ""}`}>
                <Icon className="w-[19px] h-[19px] shrink-0" strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className={`text-[8.5px] font-black uppercase tracking-widest leading-none whitespace-nowrap ${isActive ? "opacity-100" : "opacity-70"}`}>{label}</span>
            </motion.div>
          </Link>
        )
      })}
      
      {/* Botón WhatsApp Directo (Fase 15.10) */}
      <a 
        href="https://wa.me/5493446348223" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 min-w-0 transition-opacity active:opacity-60"
      >
        <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5 text-[#25D366]">
          <div className="p-1.5 rounded-xl bg-[#25D366]/10 shadow-[inset_0_0_10px_rgba(37,211,102,0.05)]">
            <MessageCircle className="w-[19px] h-[19px] shrink-0 fill-[#25D366]/10" strokeWidth={3} />
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-widest leading-none whitespace-nowrap opacity-100">WhatsApp</span>
        </motion.div>
      </a>
    </div>
  )
}
