"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { Settings, Save, Truck, PackageCheck, Loader2, CheckCircle } from "lucide-react"
import { updateStoreSettings } from "@/app/actions/settings"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single()
      if (data) {
        setShippingCost(data.shipping_cost)
        setFreeShippingThreshold(data.free_shipping_threshold)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = () => {
    setSuccess(false)
    startTransition(async () => {
      const res = await updateStoreSettings(shippingCost, freeShippingThreshold)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert(res.error)
      }
    })
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#C25E3B] animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F1E7]">
      {/* Header */}
      <div className="px-6 pt-5 pb-6 bg-[#FFF9EE]/80 backdrop-blur-md border-b border-[#DBC8B6]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3E2723]/10 rounded-2xl">
            <Settings className="w-7 h-7 text-[#3E2723]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#3E2723] tracking-tight">Configuración</h1>
            <p className="text-[#A87B6A] text-xs font-bold uppercase tracking-widest mt-0.5">Control global de la tienda</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Shipping Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF9EE] border border-[#DBC8B6] rounded-3xl p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Truck className="w-5 h-5 text-[#C25E3B]" />
            <h2 className="text-lg font-black text-[#3E2723]">Costos de Envío</h2>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#A87B6A] pl-1">Costo de Envío Fijo ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#C25E3B]">$</span>
                <input 
                  type="number" 
                  value={shippingCost} 
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-full h-14 pl-8 pr-5 rounded-2xl bg-[#EAE2D0]/30 border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white outline-none font-black text-[#3E2723] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#A87B6A] pl-1 flex items-center gap-2">
                 <PackageCheck className="w-3.5 h-3.5" /> Envío Gratis desde ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#C25E3B]">$</span>
                <input 
                  type="number" 
                  value={freeShippingThreshold} 
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full h-14 pl-8 pr-5 rounded-2xl bg-[#EAE2D0]/30 border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white outline-none font-black text-[#3E2723] transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>


      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-[88px] left-0 right-0 max-w-md mx-auto px-6 z-40">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={isPending}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest shadow-lg transition-all ${success ? "bg-emerald-500 text-white" : "bg-[#8A3A25] text-[#FFF9EE]"}`}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <><CheckCircle className="w-5 h-5" /> Configuración Guardada</>
          ) : (
            <><Save className="w-5 h-5" /> Guardar Cambios</>
          )}
        </motion.button>
      </div>
    </div>
  )
}
