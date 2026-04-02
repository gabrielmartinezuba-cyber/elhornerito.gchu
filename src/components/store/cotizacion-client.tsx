"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Clock, Users, User, MessageCircle, ChevronRight, Check, ArrowLeft, PartyPopper } from "lucide-react"
import { Product, Category } from "@/types/database"
import StorefrontNav from "@/components/store/storefront-nav"

type Step = "select" | "form" | "confirm"

export default function CotizacionClient({ products }: { products: Product[] }) {
  // Step flow
  const [step, setStep] = useState<Step>("select")
  
  const availableCategories = Array.from(new Set(products.map(p => p.category)))
  
  // Orden deseado: Salado, Dulce, A pedido (Fase 17)
  const categoryOrder: Category[] = ['Salado', 'Dulce', 'a_pedido']
  const categories = categoryOrder.filter(cat => availableCategories.includes(cat))

  const [activeCategory, setActiveCategory] = useState<Category>(categories[0] || 'Salado')

  // Selected products
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Form fields
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [guestCount, setGuestCount] = useState("")
  const [clientName, setClientName] = useState("")

  const filtered = products.filter(p => p.category === activeCategory)

  const toggleProduct = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedProducts = products.filter(p => selected.has(p.id))

  const handleWhatsApp = () => {
    const names = selectedProducts.map(p => p.name).join(", ")
    const message = `Hola soy ${clientName || "cliente"}, quiero cotización para mi evento del día ${eventDate} y hora ${eventTime}, para ${guestCount} personas, los productos que quiero son: ${names}`
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/5493446348223?text=${encodedMessage}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#EAE2D0] flex flex-col items-center">
      <main className="w-full max-w-md min-h-screen bg-[#F5F1E7] border-x border-[#DBC8B6] pb-28 relative flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#F5F1E7]/95 backdrop-blur-xl border-b border-[#DBC8B6]">
          <div className="flex items-center gap-3 px-6 pt-5 pb-4">
            {step !== "select" && (
              <button
                onClick={() => setStep(step === "confirm" ? "form" : "select")}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EAE2D0] text-[#8A3A25]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight text-[#3E2723]">Cotizá tu Evento</h1>
              <p className="text-[#A87B6A] text-xs font-semibold mt-0.5">
                {step === "select" && "Seleccioná los productos que querés"}
                {step === "form" && "Completá los datos del evento"}
                {step === "confirm" && "Revisá tu cotización"}
              </p>
              <span className="text-[10px] font-bold text-[#8A3A25] uppercase tracking-wider mt-2 block pl-1">Envíos solo en Gualeguaychú</span>
            </div>
            <div className="p-2 bg-[#C25E3B]/10 rounded-2xl">
              <PartyPopper className="w-6 h-6 text-[#C25E3B]" />
            </div>
          </div>

          {/* Steps indicator */}
          <div className="px-6 pb-4 flex gap-2">
            {(["select", "form", "confirm"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${step === s || (s === "select" && step !== "select") || (s === "form" && step === "confirm") ? "bg-[#C25E3B]" : "bg-[#DBC8B6]"}`}
              />
            ))}
          </div>

          {/* Category filter — only on select step */}
          {step === "select" && availableCategories.length > 0 && (
            <div className="px-4 pb-4 flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all shadow-sm ${activeCategory === cat ? "bg-[#C25E3B] text-[#FFF9EE] shadow-[0_4px_15px_rgba(194,94,59,0.3)]" : "bg-[#FFF9EE] text-[#8A3A25] border border-[#DBC8B6]"}`}
                >
                  {cat === "a_pedido" ? "A pedido" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── STEP: SELECT PRODUCTS ───────────────────────────────────── */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 px-4 pt-4 space-y-3"
            >
              {filtered.map(product => {
                const isSelected = selected.has(product.id)
                const imageUrl = product.image_url || (product.image_urls?.[0] ?? null)
                return (
                  <motion.button
                    key={product.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleProduct(product.id)}
                    className={`w-full flex gap-3 items-center bg-[#FFF9EE] border rounded-2xl p-3 transition-all text-left shadow-sm ${isSelected ? "border-[#C25E3B] ring-2 ring-[#C25E3B]/20 bg-[#FFF4EE]" : "border-[#DBC8B6]"}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#EAE2D0]/50 shrink-0 overflow-hidden border border-[#DBC8B6]/50 relative">
                      {imageUrl
                        ? <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#A87B6A] uppercase">Foto</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[#3E2723] line-clamp-2 leading-tight text-[14px]">{product.name}</h3>
                    </div>

                    {/* Checkbox */}
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-[#C25E3B] border-[#C25E3B]" : "border-[#DBC8B6] bg-white"}`}>
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* ─── STEP: FORM ──────────────────────────────────────────────── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="flex-1 px-6 pt-6 space-y-5"
            >
              {/* Selected products summary */}
              <div className="bg-[#EAE2D0]/50 border border-[#DBC8B6] rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] mb-2">Productos seleccionados</p>
                <div className="space-y-1">
                  {selectedProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C25E3B] shrink-0" />
                      <span className="text-[#3E2723] text-sm font-semibold">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Tu nombre (opcional)
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Juan García..."
                    className="w-full h-14 px-5 rounded-2xl bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] outline-none font-semibold text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" /> Día del evento
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] outline-none font-bold text-[#3E2723]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Horario
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] outline-none font-bold text-[#3E2723]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Cantidad de personas
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                    placeholder="Ej: 50"
                    min={1}
                    className="w-full h-14 px-5 rounded-2xl bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] outline-none font-bold text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/60"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP: CONFIRM ───────────────────────────────────────────── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="flex-1 px-6 pt-6 space-y-5"
            >
              {/* Summary card */}
              <div className="bg-[#FFF9EE] border border-[#DBC8B6] rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-5 h-5 text-[#C25E3B]" />
                  <h2 className="text-lg font-black text-[#3E2723]">Resumen del Evento</h2>
                </div>

                <div className="space-y-2 text-sm">
                  {clientName && (
                    <div className="flex justify-between">
                      <span className="text-[#A87B6A] font-semibold">Cliente</span>
                      <span className="font-black text-[#3E2723]">{clientName}</span>
                    </div>
                  )}
                  {eventDate && (
                    <div className="flex justify-between">
                      <span className="text-[#A87B6A] font-semibold">Fecha</span>
                      <span className="font-black text-[#3E2723]">{eventDate}</span>
                    </div>
                  )}
                  {eventTime && (
                    <div className="flex justify-between">
                      <span className="text-[#A87B6A] font-semibold">Horario</span>
                      <span className="font-black text-[#3E2723]">{eventTime}</span>
                    </div>
                  )}
                  {guestCount && (
                    <div className="flex justify-between">
                      <span className="text-[#A87B6A] font-semibold">Personas</span>
                      <span className="font-black text-[#3E2723]">{guestCount}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#DBC8B6] pt-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] mb-2.5">Productos pedidos</p>
                  <div className="space-y-1.5">
                    {selectedProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C25E3B] shrink-0" />
                        <span className="text-[#3E2723] font-semibold text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final message */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800 text-center leading-relaxed">
                  ✨ <strong>El Hornerito</strong> se encargará de armar las opciones y presupuestos según su solicitud.
                </p>
              </div>

              {/* WA Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleWhatsApp}
                className="w-full h-[64px] bg-[#25D366] text-white font-black text-[17px] uppercase tracking-widest rounded-[22px] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(37,211,102,0.4)]"
              >
                <MessageCircle className="w-6 h-6" />
                Contactar por WhatsApp
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ─── FLOATING CONTINUE BUTTON ─────────────────────────────────── */}
        <AnimatePresence>
          {step === "select" && selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-md w-full px-6 z-30"
            >
              <button
                onClick={() => setStep("form")}
                className="w-full h-14 bg-[#C25E3B] text-[#FFF9EE] font-black text-[17px] uppercase tracking-widest rounded-[22px] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(194,94,59,0.4)]"
              >
                {selected.size} producto{selected.size !== 1 ? "s" : ""} · Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "form" && eventDate && eventTime && guestCount && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-md w-full px-6 z-30"
            >
              <button
                onClick={() => setStep("confirm")}
                className="w-full h-14 bg-[#8A3A25] text-[#FFF9EE] font-black text-[17px] uppercase tracking-widest rounded-[22px] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(138,58,37,0.4)]"
              >
                Ver mi Cotización
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <StorefrontNav />
      </main>
    </div>
  )
}
