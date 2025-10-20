import { supabase } from "@/integrations/supabase/client";

export interface CreateExpenseInput {
  user_id: string;
  order_id?: string;
  montant: number;
}

export const expensesService = {
  // Lister toutes les dépenses
  async list() {
    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        users(nom, prenom, email),
        orders(adresse_depart, adresse_arrivee)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir les dépenses d'un utilisateur
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        orders(adresse_depart, adresse_arrivee, date_souhaitee)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Créer une dépense
  async create(input: CreateExpenseInput) {
    const { data, error } = await supabase
      .from("expenses")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une dépense
  async delete(id: string) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
