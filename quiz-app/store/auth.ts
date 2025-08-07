import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { deleteToken, getToken } from "@/lib/api";
import type { User, AuthResponse } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>(
            "/auth/login",
            {
              email,
              password,
            },
            {
              withCredentials: true,
            }
          );
          const { token, user } = response.data;
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log("posting");
          const response = await api.post<AuthResponse>(
            "/auth/register",
            {
              name,
              email,
              password,
            },
            {
              withCredentials: true,
            }
          );
          const { token, user } = response.data;
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await deleteToken();
        set({ user: null, token: null });
      },

      setUser: (user: User) => {
        set({ user });
      },
      restoreSession: async () => {
        const token = (await get().token) || (await getToken());
        if (!token) return;
        try {
          const res = await api.get<User>("/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          //@ts-ignore
          useAuthStore.setState({ user: res.data?.user, token });
          //@ts-ignore
          return res.data.user;
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
      },
    }),
    {
      name: "quiz-app-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
