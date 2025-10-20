import { supabase } from "@/integrations/supabase/client";

export interface CreateFormuleInput {
  nom: string;
  tarif_base: number;
  description?: string;
  delai_estime?: string;
  options_incluses?: Record<string, unknown>;
  actif?: boolean;
}

export const formulesService = {
  // Lister toutes les formules
  async list() {
    const { data, error } = await supabase
      .from("formules")
      .select("*")
      .order("tarif_base", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Lister les formules actives
  async listActive() {
    const { data, error } = await supabase
      .from("formules")
      .select("*")
      .eq("actif", true)
      .order("tarif_base", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtenir une formule par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("formules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une formule
  async create(input: CreateFormuleInput) {
    const { data, error } = await supabase
      .from("formules")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une formule
  async update(id: string, input: Partial<CreateFormuleInput>) {
    const { data, error } = await supabase
      .from("formules")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une formule
  async delete(id: string) {
    const { error } = await supabase
      .from("formules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
