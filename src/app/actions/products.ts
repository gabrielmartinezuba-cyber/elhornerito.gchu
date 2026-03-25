'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProductAction(productId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Error deleting product:', error.message)
    return { success: false, error: error.message }
  }

  // Revalidar el panel de admin y la tienda pública
  revalidatePath('/admin/products')
  revalidatePath('/')

  return { success: true }
}
