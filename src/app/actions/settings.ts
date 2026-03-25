"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateStoreSettings(shippingCost: number, freeShippingThreshold: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_settings')
    .update({ 
      shipping_cost: shippingCost, 
      free_shipping_threshold: freeShippingThreshold 
    })
    .eq('id', 1)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')

  return { success: true }
}

export async function getStoreSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) return null
  return data
}
