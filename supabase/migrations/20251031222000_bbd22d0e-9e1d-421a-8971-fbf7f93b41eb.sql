-- Ajouter la colonne quote_id à la table orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id);

-- Index pour améliorer les performances des recherches par quote_id
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON public.orders(quote_id);

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN public.orders.quote_id IS 'Référence au devis associé à cette commande';