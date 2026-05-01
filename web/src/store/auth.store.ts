import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeRoleName } from "@/lib/dashboard-redirect";
import type { User } from "@/types/models";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

type PersistedAuthState = Partial<Pick<AuthState, "user" | "isAuthenticated">>;

const isPersistedAuthState = (value: unknown): value is PersistedAuthState =>
  typeof value === "object" && value !== null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set("accessToken", accessToken, { expires: 1 });
        Cookies.set("refreshToken", refreshToken, { expires: 7 });
        set({
          user: { ...user, roleNama: normalizeRoleName(user.roleNama) },
          isAuthenticated: true,
        });
      },
      logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "silakap-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const persisted = isPersistedAuthState(persistedState)
          ? persistedState
          : {};

        return {
          ...currentState,
          ...persisted,
          user: persisted.user
            ? {
                ...persisted.user,
                roleNama: normalizeRoleName(persisted.user.roleNama),
              }
            : currentState.user,
        };
      },
    },
  ),
);
