import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/api/profiles";
import { fetchProfileByUserId } from "@/lib/api/profiles";
import { resetAuthState, setAuthState } from "@/lib/stores/auth.store";
import { syncClientParticipantIdentity } from "@/hooks/useMessagesStore";

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isRefreshingProfile: boolean;
  resolvedDisplayName: string | null;
  fallbackEmail: string | null;
  isProfileComplete: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const shouldBypassSupabase = import.meta.env.VITE_BYPASS_AUTH === "true";

const bypassTimestamp = "2024-01-01T00:00:00.000Z";

const bypassSession: Session = {
  access_token: "bypass-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.round(Date.now() / 1000) + 3600,
  refresh_token: "bypass-refresh",
  provider_token: null,
  provider_refresh_token: null,
  user: {
    id: "bypass-user",
    app_metadata: { provider: "email" },
    user_metadata: { full_name: "Dashboard Test" },
    aud: "authenticated",
    confirmation_sent_at: bypassTimestamp,
    confirmed_at: bypassTimestamp,
    created_at: bypassTimestamp,
    email: "dashboard@test.local",
    email_confirmed_at: bypassTimestamp,
    factors: [],
    identities: [],
    last_sign_in_at: bypassTimestamp,
    phone: null,
    phone_confirmed_at: null,
    role: "authenticated",
    updated_at: bypassTimestamp,
  },
};

const bypassProfile = {
  id: "bypass-profile",
  user_id: bypassSession.user.id,
  display_name: "Dashboard Test",
  created_at: bypassTimestamp,
  updated_at: bypassTimestamp,
} as Profile;

const computeDisplayName = (session: Session | null, profile: Profile | null): string | null => {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  const composed = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  if (composed) {
    return composed;
  }

  const email = session?.user?.email?.trim();
  if (email) {
    return email;
  }

  return session?.user?.id ?? null;
};

const applyAuthState = (session: Session | null, profile: Profile | null) => {
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
      role: "client",
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  const loadProfileForSession = useCallback(async (nextSession: Session | null) => {
    if (shouldBypassSupabase) {
      setProfile(bypassProfile);
      applyAuthState(bypassSession, bypassProfile);
      return;
    }

    if (!nextSession) {
      setProfile(null);
      applyAuthState(null, null);
      return;
    }

    try {
      const data = await fetchProfileByUserId(nextSession.user.id);
      setProfile(data ?? null);
      applyAuthState(nextSession, data ?? null);
    } catch (error) {
      console.error("Failed to load profile", error);
      setProfile(null);
      applyAuthState(nextSession, null);
    }
  }, []);

  useEffect(() => {
    if (shouldBypassSupabase) {
      setSession(bypassSession);
      setProfile(bypassProfile);
      applyAuthState(bypassSession, bypassProfile);
      setIsLoading(false);
      return;
    }

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

    const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      loadProfileForSession(nextSession ?? null);
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

    return {
      session,
      profile,
      isLoading,
      isRefreshingProfile,
      resolvedDisplayName,
      fallbackEmail,
      isProfileComplete,
      refreshProfile,
    };
  }, [isLoading, isRefreshingProfile, profile, refreshProfile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthProfile = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthProfile must be used within an AuthProvider");
  }

  return context;
};
