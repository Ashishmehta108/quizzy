import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { deleteToken, getToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLogged: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  restoreSession: () => Promise<User | undefined>;
}

interface AuthResponse {
  isLogged: boolean;
  user: User;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogged: false,
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
          const { user } = response.data;
          localStorage.setItem("isLogged", true.toString());
          set({ user, isLogged: true, isLoading: false });
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
          const { user } = response.data;
          localStorage.setItem("isLogged", true.toString());
          set({ user, isLogged: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await deleteToken();
        localStorage.setItem("isLogged", false.toString());
        set({ user: null, isLogged: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
      restoreSession: async () => {
        const isLogged = localStorage.getItem("isLogged");
        if (isLogged === "false") return;
        try {
          const res = await api.get<AuthResponse>("/auth/me", {
            withCredentials: true,
          });
          localStorage.setItem("isLogged", true.toString());
          useAuthStore.setState({ user: res.data?.user });
          return res?.data?.user;
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
      },
    }),
    {
      name: "quiz-app-auth",
      partialize: (state) => ({ user: state.user, isLogged: state.isLogged }),
    }
  )
);
