import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Invoice = Tables<"invoices">;

export const useInvoices = (clientId?: string) => {
  return useQuery({
    queryKey: ["invoices", clientId],
    queryFn: async () => {
      const baseQuery = supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await (clientId
        ? baseQuery.eq("client_id", clientId)
        : baseQuery
      ).returns<Invoice[]>();

      if (error) throw error;
      return data ?? [];
    },
  });
};
