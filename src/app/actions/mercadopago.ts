"use server"

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

export async function createPreference(orderId: string) {
  const supabase = await createClient();
  
  // 1. Obtener la orden y sus items
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error("No se pudo encontrar la orden para Mercado Pago");
  }

  // 2. Mapear items para MP
  // Nota: MP requiere que el total sea consistente con los items
  const items = order.order_items.map((item: any) => ({
    title: item.product_name || "Producto Horneado",
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    currency_id: 'ARS',
  }));

  // 3. Agregar costo de envío como un item si existe y no es retiro
  if (order.shipping_cost > 0 && order.delivery_method !== 'pickup') {
    items.push({
      title: 'Costo de Envío',
      quantity: 1,
      unit_price: Number(order.shipping_cost),
      currency_id: 'ARS',
    });
  }

  // 4. Crear preferencia con back_urls para retorno
  const preference = new Preference(client);
  const response = await preference.create({
    body: {
      items,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/?status=approved&order_id=${orderId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/?status=failure&order_id=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/?status=pending&order_id=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: 'https://tu-webhook-url.com/api/mercadopago/webhook', // Opcional para el futuro
    }
  });

  // 5. Guardar preference_id
  await supabase
    .from('orders')
    .update({ mp_preference_id: response.id })
    .eq('id', orderId);

  return { 
    id: response.id, 
    initPoint: response.init_point 
  };
}
