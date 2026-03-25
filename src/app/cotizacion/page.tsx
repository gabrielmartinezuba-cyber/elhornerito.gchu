import { createClient } from "@/lib/supabase/server"
import CotizacionClient from "@/components/store/cotizacion-client"

export const revalidate = 60

export default async function CotizacionPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return <CotizacionClient products={products || []} />
}
