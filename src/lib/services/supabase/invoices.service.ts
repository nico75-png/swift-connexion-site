import { supabase } from "@/integrations/supabase/client";

export interface CreateInvoiceInput {
  user_id: string;
  periode_debut: string;
  periode_fin: string;
  total: number;
  commandes?: Record<string, unknown>[];
  date_echeance?: string;
}

export const invoicesService = {
  // Lister toutes les factures
  async list() {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        users(nom, prenom, email, entreprise)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir une facture par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        users(nom, prenom, email, entreprise, siret, telephone)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une facture
  async create(input: CreateInvoiceInput) {
    const { data, error } = await supabase
      .from("invoices")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les factures d'un client
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marquer une facture comme payée
  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from("invoices")
      .update({ date_emission: new Date().toISOString().split("T")[0] })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
