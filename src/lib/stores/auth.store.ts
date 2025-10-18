import { useSyncExternalStore } from "react";

export type UserRole = "admin" | "client" | "driver" | "dispatch";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface AuthClient {
  id: string;
  contactName?: string;
  company?: string;
  siret?: string;
  sector?: string;
  defaultPickupAddress?: string;
  defaultDeliveryAddress?: string;
}

interface AuthState {
  currentUser: AuthUser | null;
  currentClient: AuthClient | null;
}

const defaultState: AuthState = {
  currentUser: null,
  currentClient: null,
};

let state: AuthState = defaultState;

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getAuthState = (): AuthState => state;

export const setAuthState = (patch: Partial<AuthState>) => {
  state = { ...state, ...patch };
  notify();
};

export const resetAuthState = () => {
  state = { ...defaultState };
  notify();
};

export const useAuth = () =>
  useSyncExternalStore(subscribe, () => state, () => state);

export const updateCurrentClient = (patch: Partial<AuthClient>) => {
  const current = state.currentClient;
  if (!current) return;
  setAuthState({ currentClient: { ...current, ...patch } });
};

export const updateCurrentUser = (patch: Partial<AuthUser>) => {
  const current = state.currentUser;
  if (!current) return;
  setAuthState({ currentUser: { ...current, ...patch } });
};
