"use client"

import { useState } from "react"
import { login } from "./actions"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-[#EAE2D0] flex flex-col justify-center items-center p-6 text-[#3E2723] selection:bg-[#C25E3B]/30">
      <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
        <div className="w-36 h-36 flex items-center justify-center mb-2">
           <img src="/logo.png" alt="Logo El Hornerito" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-[#3E2723] drop-shadow-sm">Panel Admin</h1>
          <p className="text-[#8A3A25] font-semibold text-sm uppercase tracking-widest">Ingresa tus credenciales</p>
        </div>
        
        <form 
          action={async (formData) => {
            setIsLoading(true)
            await login(formData)
            setIsLoading(false)
          }} 
          className="w-full bg-[#FFF9EE] border border-[#DBC8B6] p-6 rounded-[32px] shadow-[0_8px_40px_rgba(62,39,35,0.08)] flex flex-col space-y-6"
        >
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-2">Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="admin@elhornerito.com"
                className="w-full h-[52px] px-5 rounded-[20px] bg-white border border-[#DBC8B6] justify-center items-center focus:border-[#C25E3B] focus:ring-1 focus:ring-[#C25E3B]/20 outline-none transition-colors text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/50 font-semibold shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-2">Contraseña</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full h-[52px] px-5 rounded-[20px] bg-white border border-[#DBC8B6] justify-center items-center focus:border-[#C25E3B] focus:ring-1 focus:ring-[#C25E3B]/20 outline-none transition-colors text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/50 font-semibold shadow-sm"
              />
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            className="w-full h-[56px] mt-2 bg-[#8A3A25] hover:bg-[#3E2723] text-[#FFF9EE] font-black uppercase tracking-wider text-lg rounded-[20px] flex items-center justify-center transition-all shadow-[0_4px_20px_rgba(138,58,37,0.25)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Acceder"}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
