-- Add missing columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quote_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;