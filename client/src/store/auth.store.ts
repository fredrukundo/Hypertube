import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user.types";
import { saveToken, removeToken } from "@/services/auth.service";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user only
      setUser: (user) =>
        set({ user, isAuthenticated: true }),

      // Set token only
      setToken: (token) => {
        saveToken(token);
        set({ token });
      },

      // Login: set both user and token
      login: (user, token) => {
        saveToken(token);
        set({ user, token, isAuthenticated: true });
      },

      // Logout: clear everything
      logout: () => {
        removeToken();
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      // Update user fields partially
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: "hypertube_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);