import { supabase } from "@/integrations/supabase/client";

export interface CreateAddressInput {
  user_id: string;
  adresse: string;
  ville?: string;
  code_postal?: string;
  label?: string;
  is_favorite?: boolean;
}

export interface UpdateAddressInput {
  adresse?: string;
  ville?: string;
  code_postal?: string;
  label?: string;
  is_favorite?: boolean;
}

export const addressesService = {
  // Lister toutes les adresses d'un utilisateur
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir les adresses favorites
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Créer une adresse
  async create(input: CreateAddressInput) {
    const { data, error } = await supabase
      .from("addresses")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une adresse
  async update(id: string, input: UpdateAddressInput) {
    const { data, error } = await supabase
      .from("addresses")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une adresse
  async delete(id: string) {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
