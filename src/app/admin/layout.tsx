import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | El Hornerito",
  description: "Panel de control móvil",
}

import BottomNav from "@/components/admin/bottom-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#EAE2D0] text-[#3E2723] flex flex-col items-center">
      <main className="flex-1 overflow-x-hidden w-full max-w-md mx-auto relative shadow-2xl bg-[#F5F1E7] min-h-screen border-x border-[#DBC8B6] pb-20">
        {children}
        <BottomNav />
      </main>
    </div>
  )
}
