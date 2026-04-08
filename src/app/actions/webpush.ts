"use server"

import webpush from "web-push"
import { createClient } from "@/lib/supabase/server"

// Configurar con las keys de las variables de entorno
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""

webpush.setVapidDetails(
  // El subject puede ser una URL o email (mailto:)
  "mailto:soporte@elhornerito.com.ar",
  vapidPublicKey,
  vapidPrivateKey
)

export async function subscribeToPush(subscription: any) {
  const supabase = await createClient()

  // Guardar en la base de datos la suscripción
  const { error } = await supabase
    .from('admin_push_subs')
    .upsert({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }, { onConflict: 'endpoint' })

  if (error) {
    console.error("Error saving push subscription:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function sendNotificationToAdmins(payload: { title: string, body: string }) {
  const supabase = await createClient()

  // Obtener todas las suscripciones
  const { data: subs, error } = await supabase
    .from('admin_push_subs')
    .select('*')

  if (error || !subs || subs.length === 0) {
    console.log("No push subscriptions found or error:", error)
    return { success: false }
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/logo.png'
  })

  // Enviar a todas las suscripciones
  const promises = subs.map(sub => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }
    return webpush.sendNotification(pushSubscription, notificationPayload).catch(err => {
      console.error("Error sending push to", sub.endpoint, err)
      // Opcional: si el error es 410 o 404, significa que la suscripción ya no es válida y se podría eliminar de la BD.
      if (err.statusCode === 410 || err.statusCode === 404) {
        return supabase.from('admin_push_subs').delete().eq('endpoint', sub.endpoint)
      }
    })
  })

  await Promise.allSettled(promises)
  return { success: true }
}
