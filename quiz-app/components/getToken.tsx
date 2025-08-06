"use client";

import { useAuthStore } from "@/store/auth";

export const getToken = () => useAuthStore.getState().token;
