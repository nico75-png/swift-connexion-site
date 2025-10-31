import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const fetchProfileByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertProfile = async (input: {
  userId: string;
  firstName: string;
  lastName: string;
}): Promise<Profile | null> => {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.userId,
      first_name: input.firstName,
      last_name: input.lastName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }

  return fetchProfileByUserId(input.userId);
};
