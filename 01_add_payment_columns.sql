-- Migración Fase 8: Métodos de Pago y Estado
-- Ejecutar este script en el SQL Editor de Supabase

ALTER TABLE public.orders 
ADD COLUMN payment_method text,
ADD COLUMN payment_status text;
