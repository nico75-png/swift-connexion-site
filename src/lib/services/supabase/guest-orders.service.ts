import { supabase } from "@/integrations/supabase/client";

export interface CreateGuestOrderInput {
  full_name: string;
  entreprise?: string;
  email: string;
  telephone: string;
  type_colis: string;
  adresse_depart: string;
  adresse_arrivee: string;
  siret?: string;
}

export const guestOrdersService = {
  // Lister toutes les commandes invités
  async list() {
    const { data, error } = await supabase
      .from("guest_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir une commande invité par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("guest_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une commande invité
  async create(input: CreateGuestOrderInput) {
    const { data, error } = await supabase
      .from("guest_orders")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les commandes par email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from("guest_orders")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
