import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import StorefrontClient from "@/components/store/storefront-client"

export const revalidate = 0 // Opt-out of cache for real-time storefront

export default async function Page() {
  const supabase = await createClient()
  
  // Fetch productos y settings en paralelo
  const [productsRes, settingsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true)
      .neq('category', 'Congelado')
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
        title="Panadería"
        subtitle="Cosas dulces y saladas"
      />
    </Suspense>
  )
}

