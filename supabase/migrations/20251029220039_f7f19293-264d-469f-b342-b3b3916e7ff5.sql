-- Créer un utilisateur admin de test
-- Note: L'utilisateur doit être créé manuellement via Supabase Auth UI
-- Cette migration ajoute uniquement le rôle admin pour un utilisateur existant

-- Insérer le rôle admin pour l'utilisateur test admin
-- L'email sera: admin@rapideexpress.fr
-- Le mot de passe sera: AdminTest2024!

-- On va d'abord vérifier si un profil existe, sinon on ne peut pas ajouter le rôle
-- Cette requête sera exécutée après la création manuelle de l'utilisateur dans Supabase

-- Fonction pour créer un utilisateur admin de test
-- Cette fonction sera utilisée pour initialiser le compte admin
CREATE OR REPLACE FUNCTION public.setup_admin_test_user(admin_email TEXT, admin_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer ou mettre à jour le profil
  INSERT INTO public.profiles (id, user_id, first_name, last_name, display_name)
  VALUES (
    admin_user_id,
    admin_user_id,
    'Admin',
    'Test',
    'Admin Test'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name;

  -- Ajouter le rôle admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.setup_admin_test_user IS 'Configure un utilisateur comme admin de test avec profil et rôle';
