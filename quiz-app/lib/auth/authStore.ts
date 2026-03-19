import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AuthState {
  // Token state
  token: string | null;
  
  // Sync state
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  
  // Actions
  setToken: (token: string | null) => void;
  clearToken: () => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (date: Date | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    // Initial state
    token: null,
    isSyncing: false,
    lastSyncedAt: null,

    // Actions
    setToken: (token) => {
      set((state) => {
        state.token = token;
      });
    },

    clearToken: () => {
      set((state) => {
        state.token = null;
        state.isSyncing = false;
        state.lastSyncedAt = null;
      });
    },

    setSyncing: (syncing) => {
      set((state) => {
        state.isSyncing = syncing;
      });
    },

    setLastSyncedAt: (date) => {
      set((state) => {
        state.lastSyncedAt = date;
      });
    },

    reset: () => {
      set({
        token: null,
        isSyncing: false,
        lastSyncedAt: null,
      });
    },
  }))
);
