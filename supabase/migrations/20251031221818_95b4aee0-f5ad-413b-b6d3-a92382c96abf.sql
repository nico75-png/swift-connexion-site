-- Migration pour forcer la régénération des types TypeScript
-- Ajoute des commentaires aux tables principales pour documentation

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs avec informations de base';
COMMENT ON TABLE public.user_roles IS 'Rôles attribués aux utilisateurs (admin, client, driver, dispatch)';
COMMENT ON TABLE public.orders IS 'Commandes de livraison';
COMMENT ON TABLE public.client_profiles IS 'Profils clients professionnels avec informations entreprise';

-- Vérifier que les triggers existent
DO $$ 
BEGIN
    -- Vérifier si le trigger handle_new_user existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;

    -- Vérifier si le trigger set_default_user_role existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_role'
    ) THEN
        CREATE TRIGGER on_auth_user_created_role
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.set_default_user_role();
    END IF;
END $$;