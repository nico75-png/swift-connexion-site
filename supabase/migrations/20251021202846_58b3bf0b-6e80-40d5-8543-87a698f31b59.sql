-- =============================================================================
-- MIGRATION: Relations, Contraintes, Fonctions & Sécurité (COMPLET)
-- =============================================================================

-- =============================================================================
-- PARTIE 1: FONCTIONS D'IDENTITÉ & RÔLES
-- =============================================================================

-- Fonction: Récupère l'ID utilisateur courant depuis le JWT
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Fonction: Vérifie si l'utilisateur a un rôle spécifique
-- Réutilise has_role existant (déjà créé)

-- Fonction: Vérifie si l'utilisateur a au moins un des rôles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Fonction: Alias pour vérifier si admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(
    COALESCE(_user_id, auth.uid()),
    'admin'
  )
$$;

-- Fonction: Lève une erreur si l'utilisateur n'a pas le rôle
CREATE OR REPLACE FUNCTION public.assert_has_role(_role public.app_role)
RETURNS VOID
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), _role) THEN
    RAISE EXCEPTION 'Access denied: role "%" required', _role
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$;

-- Fonction: Lève une erreur si l'utilisateur n'est pas le propriétaire
CREATE OR REPLACE FUNCTION public.assert_owner(_owner_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF auth.uid() != _owner_id THEN
    RAISE EXCEPTION 'Access denied: you are not the owner'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$;

-- Fonction: Helper RLS - vérifie la propriété d'une ligne
CREATE OR REPLACE FUNCTION public.owns_row(_row_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid() = _row_user_id;
$$;

-- Fonction: Attribuer un rôle (admin uniquement)
CREATE OR REPLACE FUNCTION public.grant_role(_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_has_role('admin');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Fonction: Révoquer un rôle (admin uniquement)
CREATE OR REPLACE FUNCTION public.revoke_role(_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_has_role('admin');
  
  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = _role;
END;
$$;

-- =============================================================================
-- PARTIE 2: FONCTIONS DE NUMÉROTATION & INTÉGRITÉ
-- =============================================================================

-- Séquences pour numérotation par ressource
CREATE SEQUENCE IF NOT EXISTS public.seq_order_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_quote_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_invoice_number START 1;

-- Fonction: Génère un ID lisible unique
CREATE OR REPLACE FUNCTION public.generate_human_id(
  _resource TEXT,
  _at TIMESTAMPTZ DEFAULT now()
)
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  _year TEXT;
  _seq BIGINT;
  _prefix TEXT;
BEGIN
  _year := to_char(_at, 'YYYY');
  
  CASE _resource
    WHEN 'order' THEN
      _prefix := 'CMD';
      _seq := nextval('public.seq_order_number');
    WHEN 'quote' THEN
      _prefix := 'DEV';
      _seq := nextval('public.seq_quote_number');
    WHEN 'invoice' THEN
      _prefix := 'FAC';
      _seq := nextval('public.seq_invoice_number');
    ELSE
      RAISE EXCEPTION 'Unknown resource type: %', _resource;
  END CASE;
  
  RETURN format('%s-%s-%s', _prefix, _year, lpad(_seq::TEXT, 6, '0'));
END;
$$;

-- Fonction: Valide les transitions de statut
CREATE OR REPLACE FUNCTION public.ensure_status_transition(
  _current TEXT,
  _next TEXT,
  _allowed JSONB
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
DECLARE
  _allowed_next TEXT[];
BEGIN
  IF _current IS NULL THEN
    RETURN TRUE; -- Création initiale
  END IF;
  
  _allowed_next := ARRAY(
    SELECT jsonb_array_elements_text(_allowed -> _current)
  );
  
  IF _next = ANY(_allowed_next) OR _allowed_next IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RAISE EXCEPTION 'Invalid status transition: % -> %', _current, _next
    USING ERRCODE = 'check_violation';
END;
$$;

-- =============================================================================
-- PARTIE 3: FONCTIONS D'AUDIT
-- =============================================================================

-- Fonction: Écrire dans les logs d'audit
CREATE OR REPLACE FUNCTION public.write_audit_log(
  _action TEXT,
  _entity_type TEXT,
  _entity_id TEXT,
  _before JSONB DEFAULT NULL,
  _after JSONB DEFAULT NULL,
  _meta JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    _action,
    _entity_type,
    _entity_id,
    _before,
    _after
  );
END;
$$;

-- Trigger function générique pour audit
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _record_id TEXT;
BEGIN
  -- Détermine l'ID de l'enregistrement
  IF TG_OP = 'DELETE' THEN
    _record_id := OLD.id::TEXT;
  ELSE
    _record_id := NEW.id::TEXT;
  END IF;
  
  PERFORM public.write_audit_log(
    TG_OP,
    TG_TABLE_NAME,
    _record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================================================
-- PARTIE 4: FONCTIONS DE SOFT DELETE
-- =============================================================================

-- Ajouter colonne deleted_at aux tables pertinentes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Index pour soft delete
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON public.orders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at ON public.quotes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices(deleted_at) WHERE deleted_at IS NOT NULL;

-- Fonction: Soft delete générique
CREATE OR REPLACE FUNCTION public.soft_delete(_table TEXT, _id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL',
    _table
  ) USING _id;
END;
$$;

-- Trigger: Empêche la suppression physique sauf pour admin
CREATE OR REPLACE FUNCTION public.assert_soft_delete_only()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Physical deletion not allowed. Use soft delete.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN OLD;
END;
$$;

-- =============================================================================
-- PARTIE 5: FONCTIONS DE VALIDATION & NORMALISATION
-- =============================================================================

-- Fonction: Normaliser email
CREATE OR REPLACE FUNCTION public.normalize_email(_email TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT lower(trim(_email));
$$;

-- Fonction: Valider format email
CREATE OR REPLACE FUNCTION public.valid_email(_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT _email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
$$;

-- =============================================================================
-- PARTIE 6: RELATIONS & CONTRAINTES
-- =============================================================================

-- Relations pour orders
ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_customer
  FOREIGN KEY (customer_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_driver
  FOREIGN KEY (driver_id)
  REFERENCES public.drivers(user_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Relation quotes -> customer
ALTER TABLE public.quotes
  ADD CONSTRAINT fk_quotes_customer
  FOREIGN KEY (customer_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- Relations invoices
ALTER TABLE public.invoices
  ADD CONSTRAINT fk_invoices_customer
  FOREIGN KEY (customer_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- Relations invoice_items
ALTER TABLE public.invoice_items
  ADD CONSTRAINT fk_invoice_items_invoice
  FOREIGN KEY (invoice_id)
  REFERENCES public.invoices(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations messages
ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_sender
  FOREIGN KEY (sender_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_recipient
  FOREIGN KEY (recipient_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_thread
  FOREIGN KEY (thread_id)
  REFERENCES public.message_threads(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations addresses
ALTER TABLE public.addresses
  ADD CONSTRAINT fk_addresses_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations order_status_history
ALTER TABLE public.order_status_history
  ADD CONSTRAINT fk_order_status_history_changed_by
  FOREIGN KEY (changed_by)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- Relations notifications
ALTER TABLE public.notifications
  ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations drivers
ALTER TABLE public.drivers
  ADD CONSTRAINT fk_drivers_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations audit_logs
ALTER TABLE public.audit_logs
  ADD CONSTRAINT fk_audit_logs_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Relations user_roles
ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations client_profiles
ALTER TABLE public.client_profiles
  ADD CONSTRAINT fk_client_profiles_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Relations profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- =============================================================================
-- PARTIE 7: CONTRAINTES CHECK & VALIDATIONS
-- =============================================================================

-- Contraintes statuts orders
ALTER TABLE public.orders
  ADD CONSTRAINT check_orders_status
  CHECK (status IN ('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'));

-- Contraintes statuts quotes
ALTER TABLE public.quotes
  ADD CONSTRAINT check_quotes_status
  CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired'));

-- Contraintes statuts invoices
ALTER TABLE public.invoices
  ADD CONSTRAINT check_invoices_status
  CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- Contraintes montants positifs
ALTER TABLE public.orders
  ADD CONSTRAINT check_orders_amount_positive
  CHECK (amount IS NULL OR amount >= 0);

ALTER TABLE public.quotes
  ADD CONSTRAINT check_quotes_amount_positive
  CHECK (amount IS NULL OR amount >= 0);

ALTER TABLE public.invoices
  ADD CONSTRAINT check_invoices_amount_positive
  CHECK (amount > 0);

ALTER TABLE public.invoice_items
  ADD CONSTRAINT check_invoice_items_prices_positive
  CHECK (unit_price >= 0 AND total_price >= 0);

-- Contraintes poids/volume
ALTER TABLE public.orders
  ADD CONSTRAINT check_orders_weight_positive
  CHECK (weight_kg IS NULL OR weight_kg > 0);

ALTER TABLE public.orders
  ADD CONSTRAINT check_orders_volume_positive
  CHECK (volume_m3 IS NULL OR volume_m3 > 0);

-- Contraintes dates
ALTER TABLE public.quotes
  ADD CONSTRAINT check_quotes_valid_until
  CHECK (valid_until IS NULL OR valid_until > created_at);

ALTER TABLE public.invoices
  ADD CONSTRAINT check_invoices_due_date
  CHECK (due_date IS NULL OR due_date >= created_at::DATE);

-- =============================================================================
-- PARTIE 8: INDEX DE PERFORMANCE
-- =============================================================================

-- Index jointures orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON public.orders(customer_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON public.orders(driver_id, status) WHERE deleted_at IS NULL AND driver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_schedule_start ON public.orders(schedule_start) WHERE deleted_at IS NULL;

-- Index quotes
CREATE INDEX IF NOT EXISTS idx_quotes_customer_status ON public.quotes(customer_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until) WHERE deleted_at IS NULL;

-- Index invoices
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON public.invoices(customer_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_due_date_status ON public.invoices(due_date, status) WHERE deleted_at IS NULL AND status = 'pending';

-- Index messages
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON public.messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Index addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_type ON public.addresses(user_id, address_type);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default) WHERE is_default = TRUE;

-- Index notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC) WHERE is_read = FALSE;

-- =============================================================================
-- PARTIE 9: TRIGGERS D'AUDIT
-- =============================================================================

-- Triggers audit sur tables sensibles
DROP TRIGGER IF EXISTS audit_orders_changes ON public.orders;
CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

DROP TRIGGER IF EXISTS audit_invoices_changes ON public.invoices;
CREATE TRIGGER audit_invoices_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- =============================================================================
-- PARTIE 10: TRIGGERS SOFT DELETE
-- =============================================================================

-- Protection suppression physique
DROP TRIGGER IF EXISTS protect_orders_delete ON public.orders;
CREATE TRIGGER protect_orders_delete
  BEFORE DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.assert_soft_delete_only();

DROP TRIGGER IF EXISTS protect_quotes_delete ON public.quotes;
CREATE TRIGGER protect_quotes_delete
  BEFORE DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.assert_soft_delete_only();

DROP TRIGGER IF EXISTS protect_invoices_delete ON public.invoices;
CREATE TRIGGER protect_invoices_delete
  BEFORE DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.assert_soft_delete_only();

-- =============================================================================
-- PARTIE 11: RLS POLICIES COMPLÈTES
-- =============================================================================

-- ============= POLICIES ORDERS =============
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    deleted_at IS NULL AND (
      auth.uid() = customer_id OR
      auth.uid() = driver_id OR
      public.is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
  );

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (
    deleted_at IS NULL AND (
      auth.uid() = customer_id OR
      public.is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============= POLICIES DRIVERS =============
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;

CREATE POLICY "Drivers and admins can view drivers"
  ON public.drivers FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Drivers can update own profile"
  ON public.drivers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access drivers"
  ON public.drivers FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============= POLICIES ADDRESSES =============
CREATE POLICY "Users manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view addresses"
  ON public.addresses FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============= POLICIES INVOICE_ITEMS =============
CREATE POLICY "Users view own invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.customer_id = auth.uid()
    ) OR public.is_admin(auth.uid())
  );

-- ============= POLICIES MESSAGE_THREADS =============
CREATE POLICY "Users view own threads"
  ON public.message_threads FOR SELECT
  USING (
    auth.uid() = ANY(participants) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users create threads"
  ON public.message_threads FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- ============= POLICIES ORDER_STATUS_HISTORY =============
CREATE POLICY "Users view own order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND orders.customer_id = auth.uid()
    ) OR public.is_admin(auth.uid())
  );

CREATE POLICY "Admins insert order history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- =============================================================================
-- PARTIE 12: SEED DATA
-- =============================================================================

-- Créer un utilisateur admin fictif dans auth.users si nécessaire
-- (À faire manuellement via Supabase dashboard ou signup)

-- Seed: Assigner le rôle admin à un utilisateur
-- Remplacer <UUID> par l'ID d'un vrai utilisateur admin
COMMENT ON FUNCTION public.grant_role IS 
'To seed admin: SELECT public.grant_role(''<user-uuid>'', ''admin''::app_role);';