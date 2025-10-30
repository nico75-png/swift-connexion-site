import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "user";

export function useUserRole() {
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRole() {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Erreur récupération utilisateur:", userError);
        }

        if (!user) {
          if (!isMounted) {
            return;
          }
          setRole("user");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Erreur rôle:", error);
        }

        if (!isMounted) {
          return;
        }

        const resolvedRole = data?.role === "admin" ? "admin" : "user";
        setRole(resolvedRole);
      } catch (error) {
        console.error("Erreur inattendue lors de la récupération du rôle", error);
        if (isMounted) {
          setRole("user");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return { role, loading };
}
