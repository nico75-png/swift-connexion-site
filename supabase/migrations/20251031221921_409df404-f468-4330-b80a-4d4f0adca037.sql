-- Migration pour adapter le schéma au code existant
-- Ajoute les colonnes manquantes aux tables

-- Ajuster la table orders pour correspondre au code
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_company TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS package_type TEXT,
  ADD COLUMN IF NOT EXISTS package_note TEXT,
  ADD COLUMN IF NOT EXISTS pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS schedule_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS schedule_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS amount NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS volume_m3 NUMERIC,
  ADD COLUMN IF NOT EXISTS driver_instructions TEXT,
  ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMP WITH TIME ZONE;

-- Ajuster la table client_profiles
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS default_pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS default_delivery_address TEXT;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_schedule_start ON public.orders(schedule_start);

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN public.orders.customer_id IS 'ID du client (peut être différent de client_id pour la compatibilité)';
COMMENT ON COLUMN public.orders.customer_company IS 'Nom de l''entreprise cliente';
COMMENT ON COLUMN public.orders.sector IS 'Secteur d''activité';
COMMENT ON COLUMN public.orders.package_type IS 'Type de colis';
COMMENT ON COLUMN public.orders.schedule_start IS 'Début de la plage horaire de livraison';
COMMENT ON COLUMN public.orders.schedule_end IS 'Fin de la plage horaire de livraison';