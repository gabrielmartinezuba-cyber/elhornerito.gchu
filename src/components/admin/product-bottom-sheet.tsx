"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImagePlus, X, Loader2, AlertCircle, CheckCircle2, Upload } from "lucide-react"
import imageCompression from 'browser-image-compression'
import { createClient } from "@/lib/supabase/client"
import { Category, Product } from "@/types/database"

interface ProductBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  product?: Product | null
}

export default function ProductBottomSheet({ isOpen, onClose, onSuccess, product }: ProductBottomSheetProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState<Category>("Dulce")
  const [stockQty, setStockQty] = useState("0")

  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setPrice(product.price.toString())
      setCategory(product.category)
      setStockQty((product.stock_quantity ?? 0).toString())
      setPreviews(product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [])
    } else {
      setName("")
      setPrice("")
      setCategory("Dulce")
      setStockQty("0")
      setPreviews([])
    }
    setFiles([])
    setErrorMsg(null)
    setSuccess(false)
  }, [product, isOpen])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setErrorMsg(null)
    setCompressing(true)

    const selected = Array.from(e.target.files).slice(0, 3)

    try {
      const options = {
        maxSizeMB: 0.2, // 200 KB
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      }

      const compressedFiles = await Promise.all(
        selected.map(file => imageCompression(file, options))
      )

      // Convertimos los blobs resultantes a archivos con nombre original
      const finalFiles = compressedFiles.map((blob, i) =>
        new File([blob], selected[i].name, { type: selected[i].type })
      )

      setFiles(finalFiles)
      setPreviews(finalFiles.map(f => URL.createObjectURL(f)))
    } catch (err) {
      console.error("Compression error:", err)
      setErrorMsg("Error al optimizar las imágenes. Reintentá con otros archivos.")
    } finally {
      setCompressing(false)
    }
  }

  const handleReorder = (currentIndex: number, newIndexStr: string) => {
    const newIdx = parseInt(newIndexStr) - 1
    if (isNaN(newIdx) || newIdx < 0 || newIdx >= previews.length || newIdx === currentIndex) return

    setPreviews(prev => {
      const next = [...prev]
      const temp = next[currentIndex]
      next[currentIndex] = next[newIdx]
      next[newIdx] = temp
      return next
    })

    if (files.length > 0) {
      setFiles(prev => {
        const next = [...prev]
        const temp = next[currentIndex]
        next[currentIndex] = next[newIdx]
        next[newIdx] = temp
        return next
      })
    }
  }

  const uploadFiles = async (): Promise<string[]> => {
    if (!files.length) return previews // usar previews existentes si no hay nuevas
    const supabase = createClient()
    const uploads = files.map(async (file) => {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw new Error(`Error subiendo imagen: ${error.message}`)
      return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
    })
    return Promise.all(uploads)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const supabase = createClient()
      const imageUrls = await uploadFiles()
      const primaryUrl = imageUrls[0] ?? null

      const payload = {
        name,
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stockQty) || 0,
        in_stock: parseInt(stockQty) > 0,
        image_url: primaryUrl,
        image_urls: imageUrls,
      }

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw new Error(`Error al actualizar: ${error.message}`)
      } else {
        const { error } = await supabase.from('products').insert({ ...payload, is_published: true })
        if (error) throw new Error(`Error al guardar: ${error.message}`)
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#3E2723]/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[92vh] bg-[#F5F1E7] border-t border-[#DBC8B6] rounded-t-[32px] shadow-[0_-10px_40px_rgba(62,39,35,0.25)] z-[101] flex flex-col"
          >
            {/* Handle & Header */}
            <div className="flex justify-center pt-4 pb-3 shrink-0" onClick={onClose}>
              <div className="w-12 h-1.5 bg-[#DBC8B6] rounded-full cursor-pointer" />
            </div>
            <div className="flex justify-between items-center px-6 pb-4 border-b border-[#DBC8B6]/50 shrink-0 bg-[#F5F1E7]">
              <h2 className="text-xl font-black text-[#3E2723] tracking-tight">
                {product ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#FFF9EE] border border-[#DBC8B6] shadow-sm rounded-full text-[#8A3A25] active:scale-95 transition-transform">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-6 py-6 pb-40">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">

                  {/* Multi Image Upload (Fase 17) */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1 mb-2 block">
                      Fotos (hasta 3)
                    </label>

                    {previews.length > 0 ? (
                      <div className="flex gap-3">
                        {previews.map((src, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-[18px] overflow-hidden border border-[#DBC8B6] shadow-md shrink-0">
                            <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            {/* Control de Orden por Botones (Fase 17.1) */}
                            {previews.length > 1 && (
                              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-1.5 py-1 border border-[#8A3A25]/20 shadow-lg flex items-center gap-1.5">
                                  {[1, 2, 3].slice(0, previews.length).map((pos) => (
                                    <button
                                      key={pos}
                                      type="button"
                                      onClick={() => handleReorder(i, pos.toString())}
                                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] transition-all active:scale-90 ${i + 1 === pos
                                          ? 'bg-[#8A3A25] text-white shadow-sm'
                                          : 'text-[#8A3A25]/40 bg-[#8A3A25]/5 hover:bg-[#8A3A25]/10'
                                        }`}
                                    >
                                      {pos}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {previews.length < 3 && (
                          <button
                            type="button"
                            onClick={() => !compressing && fileInputRef.current?.click()}
                            disabled={compressing}
                            className="w-24 h-24 rounded-[18px] border border-dashed border-[#A87B6A]/50 bg-[#EAE2D0]/40 flex flex-col items-center justify-center text-[#8A3A25] shrink-0 active:scale-95 transition-transform disabled:opacity-50"
                          >
                            {compressing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-5 h-5 mb-1" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Añadir</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-full h-36 rounded-[24px] border border-dashed border-[#A87B6A]/50 bg-[#EAE2D0]/50 flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform shadow-inner relative overflow-hidden"
                        onClick={() => !compressing && fileInputRef.current?.click()}
                      >
                        {compressing ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-[#C25E3B] animate-spin mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#A87B6A] animate-pulse">Optimizando Calidad...</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-[#DBC8B6]/50 rounded-full mb-2">
                              <ImagePlus className="w-7 h-7 text-[#C25E3B]" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-[#8A3A25]">Añadir Fotos</span>
                            <span className="text-[11px] text-[#A87B6A] mt-1">Se optimizarán automáticamente</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">Descriptivo</label>
                    <input
                      type="text" required value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre del producto..."
                      className="w-full h-[60px] px-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] placeholder:text-[#A87B6A]/60 font-semibold"
                    />
                  </div>

                  {/* Precio + Stock */}
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">Precio ($)</label>
                      <input
                        type="number" required value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0"
                        className="w-full h-[60px] px-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">Stock ud.</label>
                      <input
                        type="number" required min="0" value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                        placeholder="0"
                        className="w-full h-[60px] px-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] font-semibold"
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#8A3A25] pl-1">Categoría</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full h-[60px] px-5 rounded-[20px] bg-[#FFF9EE] border border-[#DBC8B6] focus:border-[#C25E3B] focus:bg-white shadow-sm outline-none text-[#3E2723] text-[16px] font-semibold appearance-none pr-10"
                      >
                        <option value="Salado">Salado</option>
                        <option value="Dulce">Dulce</option>
                        <option value="Congelado">Congelado</option>
                        <option value="a_pedido">A pedido</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A87B6A]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-red-100 border border-red-200 rounded-[20px] flex items-start gap-3 text-red-600 text-sm shadow-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="font-semibold">{errorMsg}</p>
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-emerald-100 border border-emerald-200 rounded-[20px] flex items-center justify-center gap-2 text-emerald-700 font-black tracking-wide shadow-sm">
                      <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                      <span>¡Guardado con éxito!</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Sticky Footer Button */}
            <div className="shrink-0 p-6 pb-10 border-t border-[#DBC8B6]/50 bg-[#F5F1E7]/95 backdrop-blur-md">
              <motion.button
                form="productForm" type="submit"
                whileTap={{ scale: 0.96 }}
                disabled={loading || success}
                className="w-full h-[64px] bg-[#8A3A25] hover:bg-[#3E2723] text-[#FFF9EE] font-black uppercase tracking-widest text-[17px] rounded-[22px] flex items-center justify-center shadow-[0_8px_30px_rgba(138,58,37,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (product ? "Guardar Edición" : "Guardar Producto")}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
