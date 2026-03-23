import { createClient } from "@/lib/supabase/server"
import StorefrontClient from "@/components/store/storefront-client"

export const revalidate = 0 // Opt-out of cache for real-time storefront

export default async function Page() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return <StorefrontClient initialProducts={products || []} />
}
