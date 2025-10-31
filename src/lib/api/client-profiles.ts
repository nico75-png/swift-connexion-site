import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ClientProfile = Tables<"client_profiles">;

export const fetchClientProfileByUserId = async (userId: string): Promise<ClientProfile | null> => {
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ClientProfile>();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertClientProfile = async (input: {
  userId: string;
  companyName: string;
  siret: string;
  industry?: string | null;
}): Promise<ClientProfile | null> => {
  const { error } = await supabase.from("client_profiles").upsert(
    {
      user_id: input.userId,
      company_name: input.companyName,
      siret: input.siret,
      industry: input.industry ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return fetchClientProfileByUserId(input.userId);
};
