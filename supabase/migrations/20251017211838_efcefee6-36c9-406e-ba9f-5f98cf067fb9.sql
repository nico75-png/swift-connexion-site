-- Migration : Ajout de la taxonomie d'expertise (secteur et types de colis)

-- 1. Créer l'enum pour les secteurs d'activité
CREATE TYPE public.sector_type AS ENUM (
  'MEDICAL',
  'OPTIQUE', 
  'JURIDIQUE',
  'B2B',
  'EVENT'
);

-- 2. Créer l'enum pour les types de colis
CREATE TYPE public.package_type AS ENUM (
  'DM_CONSOMMABLES',
  'UN3373',
  'MEDICAMENTS_AMBIANT',
  'MEDICAMENTS_2_8',
  'DOCS_CONFIDENTIELS',
  'VERRES_FRAGILES',
  'MONTURES_FRAGILES',
  'LENTILLES_LIQUIDE',
  'PLV_REASSORT',
  'SAV_ATELIER',
  'DOSSIERS_CONFIDENTIELS',
  'DEPOTS_GREFFE_NOMINATIF',
  'JEUX_SIGNATURE_NOMINATIF',
  'DOCS_SCELLES',
  'PROTOTYPE',
  'PIECE_DEPANNAGE',
  'IT_ELECTRONIQUE',
  'DOCS_SENSIBLES',
  'PLV_SIGNAL',
  'GOODIES_WELCOME',
  'REGIE_MATERIEL',
  'DOCS_PROD_CONF',
  'AUTRE'
);

-- 3. Créer la table des profils clients (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  contact_name TEXT NOT NULL,
  company TEXT NOT NULL,
  siret TEXT NOT NULL,
  sector sector_type NOT NULL,
  default_pickup_address TEXT,
  default_delivery_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Activer RLS sur la table client_profiles
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer les policies RLS pour client_profiles
CREATE POLICY "Users can view their own profile"
ON public.client_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.client_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.client_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Créer la table des commandes (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_company TEXT NOT NULL,
  sector sector_type NOT NULL,
  package_type package_type NOT NULL,
  package_note TEXT,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  schedule_start TIMESTAMPTZ NOT NULL,
  schedule_end TIMESTAMPTZ NOT NULL,
  weight_kg NUMERIC(10,2) NOT NULL,
  volume_m3 NUMERIC(10,3) NOT NULL,
  driver_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'EN_ATTENTE_AFFECTATION',
  amount NUMERIC(10,2),
  driver_id TEXT,
  driver_assigned_at TIMESTAMPTZ,
  quote_id TEXT,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Activer RLS sur la table orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. Créer les policies RLS pour orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  customer_id IN (
    SELECT id::text FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id::text FROM public.client_profiles WHERE user_id = auth.uid()
  )
);

-- 9. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter le trigger sur client_profiles
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter le trigger sur orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Ajouter un constraint de validation : si package_type = 'AUTRE', package_note doit être renseigné
CREATE OR REPLACE FUNCTION public.validate_package_note()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.package_type = 'AUTRE' AND (NEW.package_note IS NULL OR trim(NEW.package_note) = '') THEN
    RAISE EXCEPTION 'Le champ package_note est obligatoire lorsque package_type est AUTRE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_orders_package_note ON public.orders;
CREATE TRIGGER validate_orders_package_note
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_package_note();

-- 11. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_sector ON public.client_profiles(sector);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_package_type ON public.orders(package_type);
CREATE INDEX IF NOT EXISTS idx_orders_sector ON public.orders(sector);