/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/api/profiles";
import { fetchProfileByUserId } from "@/lib/api/profiles";
import { resetAuthState, setAuthState, type UserRole } from "@/lib/stores/auth.store";
import { syncClientParticipantIdentity } from "@/hooks/useMessagesStore";
import { fetchUserRoles, getPrimaryRole } from "@/lib/api/user-roles";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshingProfile: boolean;
  resolvedDisplayName: string | null;
  fallbackEmail: string | null;
  isProfileComplete: boolean;
  userRole: UserRole;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const computeDisplayName = (session: Session | null, profile: Profile | null): string | null => {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";
  
  if (firstName || lastName) {
    const composed = `${firstName} ${lastName}`.trim();
    if (composed) {
      return composed;
    }
  }

  const email = session?.user?.email?.trim();
  if (email) {
    return email;
  }

  return session?.user?.id ?? null;
};

const applyAuthState = (session: Session | null, profile: Profile | null, userRole: UserRole = "client") => {
  if (!session) {
    resetAuthState();
    return;
  }

  const resolvedName = computeDisplayName(session, profile);
  const fallbackLabel = resolvedName ?? session.user.email ?? session.user.id;

  setAuthState({
    currentUser: {
      id: session.user.id,
      name: resolvedName ?? session.user.id,
      role: userRole,
      email: session.user.email ?? undefined,
    },
    currentClient: {
      id: session.user.id,
      contactName: resolvedName ?? undefined,
      company: fallbackLabel,
    },
  });

  syncClientParticipantIdentity();
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  const loadProfileForSession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setProfile(null);
      setUserRole("client");
      setIsLoadingProfile(false);
      applyAuthState(null, null);
      return;
    }

    setIsLoadingProfile(true);
    try {
      const [profileData, roles] = await Promise.all([
        fetchProfileByUserId(nextSession.user.id),
        fetchUserRoles(nextSession.user.id),
      ]);
      
      const primaryRole = getPrimaryRole(roles.length > 0 ? roles : ["client"]);
      
      setProfile(profileData ?? null);
      setUserRole(primaryRole);
      applyAuthState(nextSession, profileData ?? null, primaryRole);
    } catch (error) {
      console.error("Failed to load profile", error);
      setProfile(null);
      setUserRole("client");
      applyAuthState(nextSession, null, "client");
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        const nextSession = data.session ?? null;
        setSession(nextSession);
        await loadProfileForSession(nextSession);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialise();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, nextSession) => {
      setSession(nextSession);
      await loadProfileForSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadProfileForSession]);

  const refreshProfile = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsRefreshingProfile(true);
    try {
      await loadProfileForSession(session);
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [loadProfileForSession, session]);

  const value = useMemo<AuthContextValue>(() => {
    const resolvedDisplayName = computeDisplayName(session, profile);
    const fallbackEmail = session?.user?.email ?? null;
    const isProfileComplete = Boolean(profile?.display_name?.trim());
    const isAuthenticated = Boolean(session);
    // Inclure isLoadingProfile dans le calcul du status pour éviter les redirections prématurées
    const status: AuthStatus = (isLoading || isLoadingProfile) ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated";

    return {
      session,
      profile,
      status,
      isAuthenticated,
      isLoading: isLoading || isLoadingProfile,
      isRefreshingProfile,
      resolvedDisplayName,
      fallbackEmail,
      isProfileComplete,
      userRole,
      refreshProfile,
    };
  }, [isLoading, isLoadingProfile, isRefreshingProfile, profile, session, userRole, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const useAuthProfile = useAuth;
