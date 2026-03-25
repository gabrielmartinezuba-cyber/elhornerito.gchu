-- Migración Fase 9: Lógica de Envíos
-- Ejecutar en el Editor SQL de Supabase

ALTER TABLE public.orders 
ADD COLUMN shipping_cost numeric DEFAULT 0;
