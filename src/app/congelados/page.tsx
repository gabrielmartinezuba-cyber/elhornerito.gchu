import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import StorefrontClient from "@/components/store/storefront-client"

export const revalidate = 0

export default async function CongeladosPage() {
  const supabase = await createClient()
  
  const [productsRes, settingsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true)
      .eq('category', 'Congelado')
      .order('created_at', { ascending: false }),
    supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single()
  ])

  const products = productsRes.data || []
  const settings = settingsRes.data

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1E7]" />}>
      <StorefrontClient 
        initialProducts={products} 
        shippingCost={settings?.shipping_cost ?? 2000}
        freeShippingThreshold={settings?.free_shipping_threshold ?? 15000}
        title="Congelados"
        subtitle="Llevate nuestros productos para hornear en casa"
      />
    </Suspense>
  )
}
