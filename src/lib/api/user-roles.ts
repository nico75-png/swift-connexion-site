import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/stores/auth.store";

export interface UserRoleRecord {
  role: string;
}

/**
 * Fetch all roles for a given user from user_roles table
 */
export const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch user roles:", error);
    return [];
  }

  return (data || []).map((record) => record.role as UserRole);
};

/**
 * Determine the primary role for a user based on role hierarchy
 * Priority: admin > driver > dispatch > client
 */
export const getPrimaryRole = (roles: UserRole[]): UserRole => {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("driver")) return "driver";
  if (roles.includes("dispatch")) return "dispatch";
  return "client";
};
