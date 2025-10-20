import { supabase } from "@/integrations/supabase/client";

export interface CreateUserInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise?: string;
  siret?: string;
  secteur_activite?: string;
  mot_de_passe_hash?: string;
  preferences?: Record<string, unknown>;
}

export interface UpdateUserInput {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  siret?: string;
  secteur_activite?: string;
  preferences?: Record<string, unknown>;
}

export const usersService = {
  // Lister tous les utilisateurs
  async list() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir un utilisateur par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir un utilisateur par email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un utilisateur
  async create(input: CreateUserInput) {
    const { data, error } = await supabase
      .from("users")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un utilisateur
  async update(id: string, input: UpdateUserInput) {
    const { data, error } = await supabase
      .from("users")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un utilisateur
  async delete(id: string) {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
