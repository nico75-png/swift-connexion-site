import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const fetchProfileByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
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
      user_id: input.userId,
      first_name: input.firstName,
      last_name: input.lastName,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return fetchProfileByUserId(input.userId);
};
