"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Package, Calendar, ChevronDown, Check, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getDetailedMetrics, getStockMetrics } from "@/app/actions/metrics"
import BottomNav from "@/components/admin/bottom-nav"

type View = "ranking" | "stock"
type Period = "hoy" | "semana" | "mes" | "todo"

export default function MetricsClient() {
  const [view, setView] = useState<View>("ranking")
  const [period, setPeriod] = useState<Period>("hoy")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  // Fechas actuales para el filtro
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    calculatePeriodDates(period)
  }, [period])

  const calculatePeriodDates = (p: Period) => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    if (p === "hoy") {
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
    } else if (p === "semana") {
      from.setDate(now.getDate() - 7)
    } else if (p === "mes") {
      from.setMonth(now.getMonth() - 1)
    } else if (p === "todo") {
      from = new Date("2024-01-01") // Fecha inicio proyecto
    }

    setFromDate(from.toISOString())
    setToDate(to.toISOString())
  }

  const fetchData = async () => {
    setLoading(true)
    if (view === "ranking") {
      const res = await getDetailedMetrics(fromDate, toDate)
      setData(res.data || [])
    } else {
      const res = await getStockMetrics()
      // Excluir 'a_pedido' solo de la vista de stock
      setData((res.data || []).filter((p: any) => p.category !== 'a_pedido'))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (fromDate && toDate) fetchData()
  }, [view, fromDate, toDate])

  return (
    <div className="min-h-screen bg-[#F5F1E7] pb-24 font-sans text-[#3E2723]">
      <header className="px-6 pt-10 pb-6 bg-white shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C25E3B]/10 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-[#C25E3B]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Métricas</h1>
            <p className="text-[#A87B6A] text-sm font-semibold">Análisis de rendimiento real</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-[#EAE2D0]/50 p-1.5 rounded-2xl gap-1 mt-8 shadow-inner">
          {(["hoy", "semana", "mes", "todo"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                period === p 
                  ? "bg-[#C25E3B] text-white shadow-lg shadow-[#C25E3B]/30" 
                  : "text-[#8A3A25] hover:bg-[#EAE2D0]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-8 max-w-2xl mx-auto">
        {/* Toggle View */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setView("ranking")}
            className={`flex-1 flex flex-col items-center p-4 rounded-3xl border-2 transition-all gap-2 ${
              view === "ranking" 
                ? "bg-white border-[#C25E3B] shadow-xl text-[#C25E3B]" 
                : "bg-[#FFF9EE] border-[#DBC8B6] text-[#A87B6A]"
            }`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">Ranking: Vendidos</span>
          </button>
          <button
            onClick={() => setView("stock")}
            className={`flex-1 flex flex-col items-center p-4 rounded-3xl border-2 transition-all gap-2 ${
              view === "stock" 
                ? "bg-white border-[#C25E3B] shadow-xl text-[#C25E3B]" 
                : "bg-[#FFF9EE] border-[#DBC8B6] text-[#A87B6A]"
            }`}
          >
            <Package className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">Nivel: Stock</span>
          </button>
        </div>

        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgba(62,39,35,0.08)] border border-[#DBC8B6]/40 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <Loader2 className="w-10 h-10 text-[#C25E3B] animate-spin" />
              <p className="text-sm font-bold text-[#A87B6A] animate-pulse">Cocinando datos...</p>
            </div>
          ) : (
            <div className="p-2 sm:p-4 overflow-x-auto">
              {view === "ranking" ? (
                <div className="border border-black/10 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full border-collapse table-auto">
                    <thead>
                    <tr className="border-b border-black/20 bg-[#F5F1E7]/50">
                      <th className="text-left py-2 px-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#A87B6A]">Producto</th>
                      <th className="text-center py-2 px-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#A87B6A]">Monto $</th>
                      <th className="text-center py-2 px-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#A87B6A]">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                       <tr><td colSpan={3} className="py-20 text-center text-[#A87B6A] font-bold italic">No hay ventas registradas</td></tr>
                    ) : (
                      data.map((item, idx) => (
                        <tr key={item.id} className="border-b border-black/5 last:border-0 hover:bg-[#F5F1E7]/30 transition-colors">
                          <td className="py-2 px-4">
                            <div className="font-bold text-[#3E2723] text-sm truncate max-w-[140px] sm:max-w-none">{idx + 1}. {item.name}</div>
                          </td>
                          <td className="py-2 px-4 text-center font-black text-[#C25E3B] text-sm whitespace-nowrap">${(Number(item.totalRevenue) || 0).toLocaleString('es-AR')}</td>
                          <td className="py-2 px-4 text-center font-bold text-[#8A3A25] text-sm whitespace-nowrap">{Number(item.totalQuantity) || 0}u</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              ) : (
                <div className="border border-black/10 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full border-collapse table-auto">
                    <thead>
                      <tr className="border-b border-black/20 bg-[#F5F1E7]/50">
                        <th className="text-left py-2 px-4 text-[11px] font-black uppercase tracking-widest text-[#A87B6A]">Producto</th>
                        <th className="text-center py-2 px-4 text-[11px] font-black uppercase tracking-widest text-[#A87B6A]">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.id} className="border-b border-black/5 last:border-0 hover:bg-[#F5F1E7]/20 transition-colors">
                          <td className="py-2 px-4 font-bold text-[#3E2723] text-sm">{item.name}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black ${
                              item.stock_quantity === 0 ? "bg-red-100 text-red-600 shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]" : 
                              item.stock_quantity < 10 ? "bg-amber-100 text-amber-600" :
                              "bg-emerald-100 text-emerald-600 shadow-[inset_0_0_10px_rgba(5,150,105,0.1)]"
                            }`}>
                              {item.stock_quantity}u
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
