"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Trash2, Plus, Minus, Loader2, CheckCircle2, Phone, User, AlertCircle } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { placeOrder } from "@/app/actions/orders"

type Step = "cart" | "checkout" | "success"

export default function CartSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>("cart")

  // Checkout form
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const items = useCartStore((state) => state.items)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const getTotal = useCartStore((state) => state.getTotal)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => { setMounted(true) }, [])

  const totalItems = mounted ? getTotalItems() : 0
  const total = mounted ? getTotal() : 0

  const handleClose = () => {
    setIsOpen(false)
    // Reset to cart step after animation
    setTimeout(() => { setStep("cart"); setErrorMsg(null) }, 400)
  }

  const handleSimulateOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Completá tu nombre y teléfono antes de continuar.")
      return
    }
    setLoading(true)
    setErrorMsg(null)

    const result = await placeOrder({
      customerName,
      customerPhone,
      items,
      total,
    })

    setLoading(false)

    if (result.success) {
      clearCart()
      setStep("success")
    } else {
      setErrorMsg(result.error || "Error desconocido al procesar el pedido.")
    }
  }

  return (
    <>
      {/* FAB Floating Cart Button */}
      <AnimatePresence>
        {mounted && totalItems > 0 && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-[#C25E3B] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(194,94,59,0.4)] z-40"
          >
            <ShoppingBag className="w-7 h-7 text-[#FFF9EE]" />
            <div className="absolute -top-2 -right-2 bg-[#3E2723] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-[#F5F1E7]">
              {totalItems}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-md z-50"
            />

            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[88vh] bg-[#F5F1E7] border-t border-[#DBC8B6] rounded-t-3xl shadow-[0_-10px_40px_rgba(62,39,35,0.15)] z-50 flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0" onClick={handleClose}>
                <div className="w-12 h-1.5 bg-[#DBC8B6] rounded-full cursor-pointer" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 pb-4 border-b border-[#DBC8B6]/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C25E3B]/10 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-[#C25E3B]" />
                  </div>
                  <h2 className="text-xl font-black text-[#3E2723] tracking-tight">
                    {step === "cart" && "Tu Orden"}
                    {step === "checkout" && "Tu Datos"}
                    {step === "success" && "¡Confirmado!"}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center bg-[#FFF9EE] rounded-full text-[#A87B6A] border border-[#DBC8B6] shadow-sm active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ─── STEP: CART ────────────────────────────────────────────── */}
              <AnimatePresence mode="wait">
                {step === "cart" && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain">
                      {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-[#A87B6A] gap-4">
                          <ShoppingBag className="w-16 h-16 opacity-30" />
                          <p className="font-semibold text-sm uppercase tracking-widest">Carrito vacío</p>
                        </div>
                      )}
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div
                            key={item.product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: -100 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_, { offset, velocity }) => {
                              if (offset.x < -100 || velocity.x < -500) removeItem(item.product.id)
                            }}
                            className="w-full bg-[#FFF9EE] border border-[#DBC8B6] rounded-2xl p-3 flex gap-4 items-center touch-pan-y shadow-[0_4px_15px_rgba(62,39,35,0.04)] relative overflow-hidden"
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-100 flex items-center justify-end pr-5 -z-10">
                              <Trash2 className="w-5 h-5 text-red-500 stroke-[3]" />
                            </div>
                            <div className="w-20 h-20 rounded-xl bg-[#EAE2D0]/50 shrink-0 overflow-hidden border border-[#DBC8B6]/50">
                              {item.product.image_url
                                ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center bg-[#EAE2D0]/30"><span className="text-[10px] font-bold text-[#A87B6A] uppercase tracking-widest">Foto</span></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-extrabold text-[#3E2723] truncate text-[15px]">{item.product.name}</h3>
                              <p className="font-black text-[#C25E3B] mt-1">${item.product.price.toLocaleString('es-AR')}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-[#EAE2D0] border border-[#DBC8B6] flex items-center justify-center text-[#8A3A25] active:bg-[#DBC8B6] transition-colors">
                                  <Minus className="w-4 h-4 stroke-[3]" />
                                </button>
                                <span className="font-bold text-[#3E2723] min-w-[12px] text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-[#EAE2D0] border border-[#DBC8B6] flex items-center justify-center text-[#8A3A25] active:bg-[#DBC8B6] transition-colors">
                                  <Plus className="w-4 h-4 stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-[#DBC8B6] bg-[#FFF9EE] px-6 py-5 pb-8 shadow-[0_-10px_20px_rgba(62,39,35,0.03)] shrink-0">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[#8A3A25] font-bold uppercase tracking-widest text-sm">Total</span>
                        <span className="text-3xl font-black text-[#3E2723] tracking-tighter">
                          ${mounted ? total.toLocaleString('es-AR') : 0}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        disabled={items.length === 0}
                        onClick={() => setStep("checkout")}
                        className="w-full h-[60px] bg-[#C25E3B] hover:bg-[#8A3A25] text-[#FFF9EE] font-black text-lg rounded-2xl flex items-center justify-center shadow-[0_6px_20px_rgba(194,94,59,0.3)] transition-all disabled:opacity-50 uppercase tracking-wide"
                      >
                        Continuar →
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP: CHECKOUT ─────────────────────────────────────── */}
                {step === "checkout" && (
                  <motion.div
                    key="checkout"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 overscroll-contain pb-40">
                      {/* Order Summary mini */}
                      <div className="bg-[#EAE2D0]/50 border border-[#DBC8B6] rounded-[20px] p-4 space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] mb-3">Resumen del Pedido</p>
                        {items.map(item => (
                          <div key={item.product.id} className="flex justify-between items-center">
                            <span className="text-[#3E2723] font-semibold text-sm">{item.quantity}x {item.product.name}</span>
                            <span className="text-[#C25E3B] font-black text-sm">${(item.product.price * item.quantity).toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                        <div className="border-t border-[#DBC8B6] pt-2 mt-2 flex justify-between">
                          <span className="font-black text-[#3E2723] uppercase tracking-wider text-sm">Total</span>
                          <span className="font-black text-[#8A3A25] text-lg">${total.toLocaleString('es-AR')}</span>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25]">Tus Datos de Contacto</p>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">Nombre Completo</label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#A87B6A]" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Juan García..."
                              className="w-full h-[60px] pl-11 pr-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/60 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">WhatsApp</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#A87B6A]" />
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="11 2345-6789..."
                              className="w-full h-[60px] pl-11 pr-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/60 font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {errorMsg && (
                        <div className="p-4 bg-red-100 border border-red-200 rounded-[20px] flex items-start gap-3 text-red-600 text-sm">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="font-semibold">{errorMsg}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#DBC8B6] bg-[#F5F1E7]/95 backdrop-blur-md px-6 py-5 pb-8 space-y-3 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleSimulateOrder}
                        disabled={loading}
                        className="w-full h-[64px] bg-[#8A3A25] text-[#FFF9EE] font-black text-[17px] uppercase tracking-widest rounded-[22px] flex items-center justify-center shadow-[0_8px_30px_rgba(138,58,37,0.4)] transition-all disabled:opacity-60"
                      >
                        {loading
                          ? <Loader2 className="w-6 h-6 animate-spin" />
                          : "Simular Compra 🛍️"
                        }
                      </motion.button>
                      <button
                        onClick={() => setStep("cart")}
                        className="w-full text-center text-sm font-semibold text-[#A87B6A] py-2 active:opacity-60 transition-opacity"
                      >
                        ← Volver al carrito
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP: SUCCESS ──────────────────────────────────────── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center px-8 gap-6 pb-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle2 className="w-14 h-14 text-emerald-500 stroke-[1.5]" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-black text-[#3E2723] tracking-tight">¡Pedido Confirmado!</h3>
                      <p className="text-[#A87B6A] font-semibold text-base leading-relaxed">
                        Tu pedido fue registrado exitosamente.<br />El equipo de <strong className="text-[#8A3A25]">El Hornerito</strong> lo estará preparando.
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleClose}
                      className="w-full h-[60px] bg-[#C25E3B] text-[#FFF9EE] font-black text-[17px] uppercase tracking-widest rounded-[22px] flex items-center justify-center shadow-[0_8px_30px_rgba(194,94,59,0.35)] mt-4"
                    >
                      Seguir Explorando
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
