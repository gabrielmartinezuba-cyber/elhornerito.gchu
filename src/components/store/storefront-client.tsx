"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, PackageOpen, X, ChevronLeft, ChevronRight, Truck } from "lucide-react"
import CartSheet from "@/components/store/cart-sheet"
import { useCartStore } from "@/store/cartStore"
import { Product, Category } from "@/types/database"

const CATEGORIES: ("Todos" | Category)[] = ["Todos", "Dulce", "Salado"]

// ─── Lightbox Gallery Modal ───────────────────────────────────────────────────
function GalleryModal({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(images.length - 1, i + 1))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center"
        onClick={onClose}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Swipe Container */}
        <motion.div
          key={index}
          className="relative w-full max-w-md px-6"
          onClick={e => e.stopPropagation()}
        >
          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={images[index]}
            alt={`Foto ${index + 1}`}
            className="w-full max-h-[70vh] rounded-[24px] object-contain select-none"
            draggable={false}
          />

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={index === 0}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                disabled={index === images.length - 1}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </motion.div>

        {/* Dot Indicators — Instagram style */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-5" onClick={e => e.stopPropagation()}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all duration-200 ${i === index ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const items = useCartStore(s => s.items)
  const addItem = useCartStore(s => s.addItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)

  const [mounted, setMounted] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const itemInCart = mounted ? items.find(i => i.product.id === product.id) : undefined
  const qty = itemInCart?.quantity ?? 0

  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : []

  const outOfStock = product.stock_quantity === 0
  const atMax = qty >= product.stock_quantity

  const handleAdd = () => {
    if (outOfStock || atMax) return
    addItem(product)
  }

  const handleDecrease = () => {
    if (qty <= 0) return
    updateQuantity(product.id, qty - 1)
  }

  return (
    <>
      {/* Card — estructura idéntica al ítem del carrito */}
      <div className={`w-full bg-[#FFF9EE] border border-[#DBC8B6] rounded-2xl p-3 flex gap-4 items-center shadow-[0_4px_15px_rgba(62,39,35,0.04)] transition-opacity ${outOfStock ? "opacity-50" : ""}`}>

        {/* Thumbnail cuadrada — tap abre lightbox */}
        <button
          className="w-20 h-20 rounded-xl bg-[#EAE2D0]/50 shrink-0 overflow-hidden border border-[#DBC8B6]/50 relative"
          onClick={() => { if (images.length > 0) { setLightboxIdx(0); setLightboxOpen(true) } }}
        >
          {images.length > 0 ? (
            <>
              <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-[3px]">
                  {images.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#EAE2D0]/30">
              <span className="text-[10px] font-bold text-[#A87B6A] uppercase tracking-widest">Foto</span>
            </div>
          )}
        </button>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-extrabold text-[#3E2723] line-clamp-2 leading-tight text-[15px] min-h-[2.5rem] flex items-center">{product.name}</h3>
          <p className="font-black text-[#C25E3B] mt-1">${mounted ? product.price.toLocaleString('es-AR') : product.price}</p>

          <div className="flex items-center gap-3 mt-2">
              <>
                <button
                  onClick={handleDecrease}
                  disabled={qty === 0}
                  className={`w-8 h-8 rounded-full border border-[#DBC8B6] flex items-center justify-center text-[#8A3A25] transition-colors shrink-0 ${qty === 0 ? "bg-[#EAE2D0]/30 opacity-40 cursor-not-allowed" : "bg-[#EAE2D0] active:bg-[#DBC8B6]"}`}
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>

                <span className="font-bold text-[#3E2723] min-w-[20px] text-center">
                  {qty}
                </span>

                <button
                  onClick={handleAdd}
                  disabled={atMax || outOfStock}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${atMax || outOfStock ? "bg-[#EAE2D0] text-[#A87B6A] border border-[#DBC8B6] cursor-not-allowed" : "bg-[#C25E3B] text-white shadow-[0_4px_12px_rgba(194,94,59,0.3)] active:scale-90"}`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>

                {outOfStock && (
                  <span className="text-[10px] font-black text-[#A87B6A] uppercase tracking-widest ml-1">Sin Stock</span>
                )}
                {!outOfStock && atMax && qty > 0 && (
                  <span className="text-[10px] font-black text-[#A87B6A]/60 uppercase tracking-widest ml-1">Tope Stock</span>
                )}
              </>
          </div>
        </div>
      </div>

      {lightboxOpen && images.length > 0 && (
        <GalleryModal images={images} initialIndex={lightboxIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StorefrontClient({ initialProducts }: { initialProducts: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<"Todos" | Category>("Todos")

  // Separar con stock primero, sin stock al final
  const sorted = [...initialProducts].sort((a, b) => {
    if (a.stock_quantity === 0 && b.stock_quantity !== 0) return 1
    if (a.stock_quantity !== 0 && b.stock_quantity === 0) return -1
    return 0
  })

  const filtered = activeCategory === "Todos"
    ? sorted
    : sorted.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#EAE2D0] flex flex-col items-center">
      <main className="w-full max-w-md min-h-screen bg-[#F5F1E7] border-x border-[#DBC8B6] pb-32 relative flex flex-col">

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 pt-safe bg-[#F5F1E7]/90 backdrop-blur-xl border-b border-[#DBC8B6]">
          <div className="flex justify-between items-center px-6 pt-5 pb-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#3E2723] mb-0.5 drop-shadow-sm">El Hornerito</h1>
              <p className="text-[#A87B6A] text-sm font-semibold">Cosas dulces y saladas</p>
              <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-[#C25E3B]/10 rounded-full w-fit">
                <Truck className="w-4 h-4 text-[#C25E3B]" />
                <span className="text-[11px] font-black text-[#8A3A25] uppercase tracking-wider">Envío gratis desde $15.000</span>
              </div>
            </div>
            <div className="w-24 h-24 shrink-0 flex items-center justify-center pl-2">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
          </div>

          {/* Category Pills */}
          <div className="px-6 pb-4 flex gap-3">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat
                    ? "bg-[#C25E3B] text-[#FFF9EE] shadow-[0_4px_15px_rgba(194,94,59,0.3)]"
                    : "bg-[#FFF9EE] text-[#8A3A25] border border-[#DBC8B6]"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Product List — Compact Cards */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-6">
          {filtered.length === 0 ? (
            <div className="pt-20 flex flex-col items-center justify-center text-center opacity-60">
              <PackageOpen className="w-16 h-16 text-[#A87B6A] mb-4" strokeWidth={1.5} />
              <p className="text-[#8A3A25] font-black uppercase tracking-widest">Aún no hay stock</p>
              <p className="text-[#A87B6A] text-sm mt-1 font-semibold">Vuelve pronto a revisar.</p>
            </div>
          ) : (
            filtered.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>

        <CartSheet />
      </main>
    </div>
  )
}
