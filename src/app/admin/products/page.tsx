"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, MoreVertical, Edit2, Trash2, X, RefreshCw } from "lucide-react"
import ProductBottomSheet from "@/components/admin/product-bottom-sheet"
import { createClient } from "@/lib/supabase/client"
import { Product } from "@/types/database"

export default function ProductsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Options Sheet State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  
  const supabase = createClient()

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async () => {
    if (!activeProduct) return
    const { error } = await supabase.from('products').delete().eq('id', activeProduct.id)
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== activeProduct.id))
      setActiveProduct(null)
    }
  }

  const handleEdit = () => {
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full h-full flex flex-col relative pt-safe bg-[#F5F1E7]">
      <div className="sticky top-0 w-full px-6 py-4 bg-[#F5F1E7]/90 backdrop-blur-xl z-30 border-b border-[#DBC8B6]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#3E2723] drop-shadow-sm">Catálogo</h1>
            <p className="text-[#A87B6A] text-sm font-bold mt-0.5 uppercase tracking-wider">Gestión de stock</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setActiveProduct(null)
                setIsModalOpen(true)
              }}
              className="w-12 h-12 bg-[#8A3A25] text-[#FFF9EE] flex items-center justify-center rounded-[18px] shadow-[0_4px_15px_rgba(138,58,37,0.3)]"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </motion.button>
          </div>
        </div>

        {/* Búsqueda Táctil */}
        <div className="relative mt-2">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A3A25] opacity-50 stroke-[3]" />
          <input 
            type="text"
            placeholder="Buscar producto..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[52px] pl-12 pr-4 bg-[#FFF9EE] border border-[#DBC8B6] rounded-2xl text-[16px] text-[#3E2723] focus:border-[#C25E3B] focus:bg-white outline-none transition-all placeholder:text-[#A87B6A] font-semibold shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-32 space-y-3">
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-[#A87B6A]">
             <RefreshCw className="w-8 h-8 animate-spin mb-4 text-[#8A3A25]" />
             <p className="font-bold text-sm tracking-widest uppercase">Cargando catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="w-full py-20 text-center text-[#A87B6A]">
            <p className="font-bold text-sm uppercase tracking-widest">No hay productos.</p>
          </div>
        ) : (
          filteredProducts.map((item) => (
            <motion.div 
              key={item.id}
              className="w-full bg-[#FFF9EE] border border-[#DBC8B6] rounded-[24px] p-4 flex gap-4 items-center shadow-[0_4px_15px_rgba(62,39,35,0.03)]"
            >
              <div className="w-16 h-16 rounded-[16px] bg-[#EAE2D0]/60 shrink-0 flex items-center justify-center overflow-hidden border border-[#DBC8B6]/50">
                 {item.image_url ? (
                   <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-[#A87B6A] text-[10px] font-black uppercase tracking-widest">Foto</div>
                 )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-extrabold text-[#3E2723] truncate text-[16px] leading-tight">{item.name}</h3>
                <p className="text-[11px] text-[#8A3A25] font-black uppercase tracking-widest mt-1">{item.category} • Stock: Sí</p>
                <p className="font-black text-[#C25E3B] mt-1.5 text-[15px]">${item.price.toLocaleString('es-AR')}</p>
              </div>
              
              <button 
                onClick={() => setActiveProduct(item)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#EAE2D0]/50 text-[#8A3A25] active:bg-[#DBC8B6] transition-colors border border-transparent active:border-[#DBC8B6] shrink-0"
              >
                <MoreVertical className="w-5 h-5 stroke-[2.5]" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <ProductBottomSheet 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={activeProduct}
        onSuccess={() => {
          fetchProducts() // Recarga tras edit o guardado
        }}
      />

      {/* Action Sheet Modal (Opciones 3 Puntos) */}
      <AnimatePresence>
        {activeProduct && !isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProduct(null)}
              className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#F5F1E7] border-t border-[#DBC8B6] rounded-t-[32px] p-6 pb-[env(safe-area-inset-bottom,24px)] z-[111] shadow-[0_-10px_50px_rgba(62,39,35,0.2)]"
            >
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-lg font-black text-[#3E2723] tracking-tight truncate pr-4">{activeProduct.name}</h3>
                   <p className="text-sm font-semibold text-[#A87B6A]">Opciones de producto</p>
                 </div>
                 <button 
                   onClick={() => setActiveProduct(null)}
                   className="w-9 h-9 flex items-center justify-center bg-[#FFF9EE] border border-[#DBC8B6] shadow-sm rounded-full text-[#8A3A25] active:scale-95 transition-transform shrink-0"
                 >
                   <X className="w-5 h-5 stroke-[2.5]" />
                 </button>
              </div>

              <div className="space-y-3 pb-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="w-full h-14 bg-[#FFF9EE] border border-[#DBC8B6] rounded-[20px] flex items-center justify-center gap-3 text-[#3E2723] font-black uppercase tracking-wider shadow-sm active:bg-[#EAE2D0]"
                >
                  <Edit2 className="w-5 h-5 text-[#8A3A25]" />
                  Editar Producto
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="w-full h-14 bg-red-50 border border-red-200 rounded-[20px] flex items-center justify-center gap-3 text-red-600 font-black uppercase tracking-wider shadow-sm active:bg-red-100"
                >
                  <Trash2 className="w-5 h-5 stroke-[2.5]" />
                  Eliminar Producto
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
