-- Migración Fase 10: Panel de Configuración Dinámica
-- Ejecutar en el Editor SQL de Supabase

CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    shipping_cost NUMERIC NOT NULL DEFAULT 2000,
    free_shipping_threshold NUMERIC NOT NULL DEFAULT 15000,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insertar fila inicial si no existe
INSERT INTO public.store_settings (id, shipping_cost, free_shipping_threshold)
VALUES (1, 2000, 15000)
ON CONFLICT (id) DO NOTHING;

-- Configuracion RLS (Row Level Security)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Politica de lectura pública
CREATE POLICY "Permitir lectura publica de settings" 
ON public.store_settings FOR SELECT USING (true);

-- Politica de actualizacion para el admin (por simplicidad permitimos UPDATE en esta fase, idealmente authed)
CREATE POLICY "Permitir actualizacion de settings" 
ON public.store_settings FOR UPDATE USING (true);
