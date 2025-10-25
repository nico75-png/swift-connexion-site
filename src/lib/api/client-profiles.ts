// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ClientProfile = Tables<"client_profiles">;

export const fetchClientProfileByUserId = async (userId: string): Promise<ClientProfile | null> => {
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertClientProfile = async (input: {
  userId: string;
  contactName: string;
  company: string;
  siret: string;
  sector: ClientProfile["sector"];
  defaultPickupAddress?: string | null;
  defaultDeliveryAddress?: string | null;
}): Promise<ClientProfile | null> => {
  const { error } = await supabase.from("client_profiles").upsert(
    {
      user_id: input.userId,
      contact_name: input.contactName,
      company: input.company,
      siret: input.siret,
      sector: input.sector,
      default_pickup_address: input.defaultPickupAddress ?? null,
      default_delivery_address: input.defaultDeliveryAddress ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return fetchClientProfileByUserId(input.userId);
};
