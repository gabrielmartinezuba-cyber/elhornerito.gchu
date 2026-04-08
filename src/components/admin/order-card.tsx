"use client"

import { useTransition, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageCircle, CheckCheck, Loader2, XCircle } from "lucide-react"
import { markOrderDelivered, cancelOrder, markOrderPaid } from "@/app/actions/orders"
import { Order, OrderItem } from "@/types/database"

type OrderItemWithName = OrderItem & { product_name: string }
type OrderWithItems = Order & { order_items: OrderItemWithName[] }

// Formatea la fecha SOLO en cliente para evitar hydration mismatch
function useFormattedDate(dateStr: string) {
  const [formatted, setFormatted] = useState<string | null>(null)
  useEffect(() => {
    const d = new Date(dateStr)
    const time = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(d)
    const date = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    }).format(d)
    setFormatted(`${time} · ${date}`)
  }, [dateStr])
  return formatted
}

interface OrderCardProps {
  order: OrderWithItems
  onDelivered?: (orderId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function OrderCard({ order, onDelivered, showActions = true, compact = false }: OrderCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)
  const formattedDate = useFormattedDate(order.created_at)

  const phone = order.customer_phone?.replace(/\D/g, '') ?? ''
  const waText = encodeURIComponent(`¡Hola ${order.customer_name}! Tu pedido de El Hornerito se encuentra en preparacion, te avisaremos cuando este listo para coordinar la entrega 🧁🥐`)
  const waLink = `https://wa.me/54${phone}?text=${waText}`

  const handleDelivered = () => {
    startTransition(async () => {
      const result = await markOrderDelivered(order.id)
      if (result.success) onDelivered?.(order.id)
    })
  }

  const handleMarkPaid = () => {
    startTransition(async () => {
      const result = await markOrderPaid(order.id)
      if (result.success) {
        // En este caso no quitamos de la lista si solo marcó como pagado, 
        // pero necesitamos forzar un refresco si no se hace automático
        window.location.reload()
      }
    })
  }

  const handleCancel = () => {
    if (window.confirm("¿Seguro querés cancelar esta orden? Esta acción no se puede deshacer y el stock será devuelto al catálogo.")) {
      startTransition(async () => {
        const result = await cancelOrder(order.id)
        if (result.success) onDelivered?.(order.id) // Re-usamos onDelivered para quitar de la lista
        else alert(result.error)
      })
    }
  }

  const isDelivered = order.status === 'delivered'

  // Para el resumen en modo compacto
  const firstItem = order.order_items[0]
  const otherItemsCount = order.order_items.length - 1
  const itemsSummary = firstItem 
    ? `${firstItem.quantity}× ${firstItem.product_name}${otherItemsCount > 0 ? ` +${otherItemsCount}` : ''}`
    : 'Sin ítems'

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`w-full bg-[#FFF9EE] border border-[#DBC8B6] rounded-[22px] shadow-[0_4px_20px_rgba(62,39,35,0.06)] cursor-pointer overflow-hidden transition-all duration-150 ease-in-out ${compact ? 'p-3 space-y-2.5' : (isExpanded ? 'p-5 space-y-4' : 'p-4')}`}
    >
      {/* ─── VISTA COMPACTA ─── */}
      {!isExpanded ? (
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-[#3E2723] tracking-tight text-[15px] truncate max-w-[100px]">
            {order.customer_name}
          </h3>
          <span className="flex-1 text-[#A87B6A] text-[12px] font-bold truncate text-center px-2">
            {itemsSummary}
          </span>
          <span className="font-black text-[#C25E3B] tracking-tighter shrink-0 text-base">
            ${Number(order.total_amount).toLocaleString('es-AR')}
          </span>
        </div>
      ) : (
      /* ─── VISTA EXPANDIDA ─── */
      <div 
        className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
        onClick={(e) => e.stopPropagation()} // Para evitar que clics internos colapsen la tarjeta
      >
        {/* Header: Nombre + Badge estado + Total */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(false)}>
            <h3 className={`font-black text-[#3E2723] tracking-tight ${compact ? 'text-[15px]' : 'text-[17px]'} cursor-pointer`}>
              {order.customer_name}
            </h3>
            
            {/* Badges de Estado y Logística - Ocultos en modo compacto */}
            {!compact && (
              <div className="flex flex-row items-center gap-2 mt-2 whitespace-nowrap">
                {order.payment_status === 'paid' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    PAGO: SÍ
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                    PAGO: NO
                  </span>
                )}
                {order.delivery_method === 'pickup' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full shrink-0">
                    RETIRO
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full shrink-0">
                    ENVÍO
                  </span>
                )}
              </div>
            )}

            {/* Fecha renderizada solo en cliente para evitar hydration mismatch */}
            <p className={`font-bold text-[#A87B6A] tracking-wider ${compact ? 'text-[9.5px] mt-1' : 'text-[11px] mt-2.5'}`} suppressHydrationWarning>
              {formattedDate ?? ''}
            </p>
          </div>
          <span className={`font-black text-[#C25E3B] tracking-tighter shrink-0 ${compact ? 'text-lg' : 'text-xl'}`}>
            ${Number(order.total_amount).toLocaleString('es-AR')}
          </span>
        </div>

        {/* Items del pedido */}
        <div className={`bg-[#EAE2D0]/50 border border-[#DBC8B6]/50 rounded-[16px] p-3 ${compact ? 'space-y-1' : 'space-y-1.5'}`}>
          {order.order_items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className={`text-[#3E2723] font-semibold ${compact ? 'text-[13px]' : ''}`}>{item.quantity}× {item.product_name}</span>
              <span className={`text-[#8A3A25] font-black ${compact ? 'text-[13px]' : ''}`}>${(item.unit_price * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}

          {/* Desglose de Envío (Fase 15.7) */}
          {Number(order.shipping_cost) > 0 && (
            <div className="flex justify-between items-center text-sm pt-1 mt-1 border-t border-[#DBC8B6]/30 opacity-80">
              <span className={`text-[#3E2723] font-medium italic ${compact ? 'text-[12px]' : ''}`}>Costo de Envío</span>
              <span className={`text-[#8A3A25] font-black ${compact ? 'text-[12px]' : ''}`}>${Number(order.shipping_cost).toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

      {/* Acciones — Alinhadas horizontalmente e compactas */}
      {showActions && !isDelivered && (
        <div className="flex flex-col gap-2">
          {/* Fila 1: WhatsApp y Cancelar */}
          <div className="flex items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 bg-[#25D366] rounded-xl flex items-center justify-center gap-1.5 text-white font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4 stroke-[2.5]" />
              WhatsApp
            </a>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 h-10 border border-red-200 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-1.5 font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 stroke-[2.5]" />}
              Cancelar
            </motion.button>
          </div>

          {/* Fila 2: Pagado y Entregado */}
          <div className="flex items-center gap-2">
            {order.payment_status !== 'paid' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkPaid}
                disabled={isPending}
                className="flex-1 h-10 bg-[#FFF9EE] border-2 border-emerald-600 text-emerald-700 rounded-xl flex items-center justify-center gap-1.5 font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4 text-emerald-600" />}
                Pagado
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDelivered}
              disabled={isPending}
              className="flex-1 h-10 bg-[#3E2723] rounded-xl flex items-center justify-center gap-1.5 text-[#FFF9EE] font-black text-[11px] uppercase tracking-wider shadow-sm disabled:opacity-50 transition-all"
            >
              {isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><CheckCheck className="w-4 h-4 stroke-[2.5]" /> Entregado</>
              }
            </motion.button>
          </div>
        </div>
        )}
      </div>
      )}
    </motion.div>
  )
}
