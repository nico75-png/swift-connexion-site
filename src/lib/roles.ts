import { supabase } from "@/integrations/supabase/client";

async function fetchCurrentUserRole() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Unable to retrieve authenticated user", userError);
    return null;
  }

  const user = userData?.user;
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Unable to retrieve user role", error);
    return null;
  }

  return data?.role ?? null;
}

export async function isAdmin() {
  const role = await fetchCurrentUserRole();
  return role === "admin";
}

export async function isUser() {
  const role = await fetchCurrentUserRole();
  return role === "user";
}

