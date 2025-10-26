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

const computeDisplayName = (session: Session | null, profile: Profile | null): string | null => {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  if (profile?.first_name || profile?.last_name) {
    const composed = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
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
