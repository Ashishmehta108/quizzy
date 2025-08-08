import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { deleteToken, getToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  restoreSession: () => Promise<User | undefined>;
}

interface AuthResponse {
  token: string;
  user: User;
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
          localStorage.setItem("access_token", token);
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
          localStorage.setItem("access_token", token);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await deleteToken();
        localStorage.setItem("access_token", "");
        set({ user: null, token: null });
      },

      setUser: (user: User) => {
        set({ user });
      },
      restoreSession: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
          const res = await api.get<AuthResponse>("/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          //@ts-ignore

          localStorage.setItem("access_token", res.data.token);
          useAuthStore.setState({ user: res.data?.user, token });
          //@ts-ignore
          return res?.data?.user;
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
