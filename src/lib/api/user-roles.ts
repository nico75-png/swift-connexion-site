import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/stores/auth.store";

export interface UserRoleRecord {
  role: string;
}

const coerceRoles = (value: unknown): UserRole[] => {
  if (!value) {
    return [];
  }

  const candidate = Array.isArray(value) ? value : [value];
  return candidate
    .map((entry) => (typeof entry === "string" ? entry.toLowerCase().trim() : ""))
    .filter((entry): entry is UserRole => ["admin", "client", "driver", "dispatch"].includes(entry as UserRole));
};

const parseMetadataRoles = (metadata: Record<string, unknown> | null | undefined): UserRole[] => {
  if (!metadata) {
    return [];
  }

  const directRole = metadata.role;
  const roles = metadata.roles;

  return [...coerceRoles(directRole), ...coerceRoles(roles)];
};

/**
 * Fetch all roles for a given user by combining user_roles, admin table and metadata hints.
 */
export const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
  const roles = new Set<UserRole>();

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.warn("Failed to fetch user roles:", error);
  } else {
    (data ?? []).forEach((record) => {
      const role = record.role as UserRole;
      if (role) {
        roles.add(role);
      }
    });
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users" as never)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminError && adminRecord) {
    roles.add("admin");
  }

  const { data: baseUser, error: baseUserError } = await supabase
    .from("app_users" as never)
    .select("metadata")
    .eq("user_id", userId)
    .maybeSingle();

  if (!baseUserError && baseUser) {
    parseMetadataRoles((baseUser as any).metadata).forEach((role) => roles.add(role));
  }

  return Array.from(roles);
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
