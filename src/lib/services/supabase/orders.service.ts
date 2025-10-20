import { supabase } from "@/integrations/supabase/client";

export interface CreateOrderInput {
  user_id?: string;
  adresse_depart: string;
  adresse_arrivee: string;
  date_souhaitee: string;
  poids_kg?: number;
  dimensions?: string;
  instructions?: string;
  formule_id?: string;
  options?: Record<string, unknown>;
}

export interface UpdateOrderInput {
  driver_id?: string;
  adresse_depart?: string;
  adresse_arrivee?: string;
  date_souhaitee?: string;
  poids_kg?: number;
  dimensions?: string;
  instructions?: string;
  options?: Record<string, unknown>;
}

export const ordersService = {
  // Lister toutes les commandes
  async list() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users(nom, prenom, email, entreprise),
        drivers(nom_complet, telephone, type_vehicule)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir une commande par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users(nom, prenom, email, entreprise, siret, telephone),
        drivers(nom_complet, telephone, type_vehicule, email),
        formules(nom, tarif_base, options_incluses)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une commande
  async create(input: CreateOrderInput) {
    const { data, error } = await supabase
      .from("orders")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une commande
  async update(id: string, input: UpdateOrderInput) {
    const { data, error } = await supabase
      .from("orders")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une commande
  async delete(id: string) {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Affecter un chauffeur
  async assignDriver(orderId: string, driverId: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ driver_id: driverId })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les commandes d'un client
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        drivers(nom_complet, telephone),
        formules(nom, tarif_base)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir les commandes d'un chauffeur
  async getByDriverId(driverId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("driver_id", driverId)
      .order("date_souhaitee", { ascending: true });

    if (error) throw error;
    return data;
  },

  // S'abonner aux changements en temps réel
  subscribeToChanges(callback: (payload: any) => void) {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
