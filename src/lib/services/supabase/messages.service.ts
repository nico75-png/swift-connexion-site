import { supabase } from "@/integrations/supabase/client";

export interface CreateMessageInput {
  sender_kind?: string;
  sender_id?: string;
  recipient_kind?: string;
  recipient_id?: string;
  sujet?: string;
  contenu?: string;
  order_id?: string;
}

export const messagesService = {
  // Lister tous les messages
  async list() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir un message par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un message
  async create(input: CreateMessageInput) {
    const { data, error } = await supabase
      .from("messages")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer un message comme lu
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from("messages")
      .update({ lu_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les messages d'un utilisateur
  async getByRecipientId(recipientId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir les messages liés à une commande
  async getByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },
};
