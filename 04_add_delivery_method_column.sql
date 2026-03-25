-- Migración Fase 11: Opciones de Logística (Envio vs Retiro)
-- Ejecutar en el Editor SQL de Supabase

ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'pickup'));
