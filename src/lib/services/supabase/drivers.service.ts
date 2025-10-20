import { supabase } from "@/integrations/supabase/client";

export interface CreateDriverInput {
  nom_complet: string;
  telephone: string;
  email?: string;
  type_vehicule?: string;
  immatriculation?: string;
  capacite_kg?: number;
  statut?: string;
}

export interface UpdateDriverInput {
  nom_complet?: string;
  telephone?: string;
  email?: string;
  type_vehicule?: string;
  immatriculation?: string;
  capacite_kg?: number;
  statut?: string;
}

export const driversService = {
  // Lister tous les chauffeurs
  async list() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir un chauffeur par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un chauffeur
  async create(input: CreateDriverInput) {
    const { data, error } = await supabase
      .from("drivers")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un chauffeur
  async update(id: string, input: UpdateDriverInput) {
    const { data, error } = await supabase
      .from("drivers")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un chauffeur
  async delete(id: string) {
    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Obtenir les chauffeurs disponibles
  async getAvailable() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("statut", "ACTIVE")
      .order("nom_complet");

    if (error) throw error;
    return data;
  },
};
