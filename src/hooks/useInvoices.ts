import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (customerId?: string) => {
  return useQuery({
    queryKey: ["invoices", customerId],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Invoice[];
    },
  });
};
