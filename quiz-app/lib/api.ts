"use client";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import { getAuthHeaders } from "@/lib/auth/authService";

async function getSessionToken() {
  const { data: session } = await authClient.getSession();
  return session?.session?.token || null;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACK_URL! + "/api",
  withCredentials: true,
});

export const deleteToken = async () => {
  const t = await fetch("/api/cookie", {
    method: "DELETE",
  });
};

export const setToken = async (token: string) => {
  const t = await fetch("/api/cookie", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
};

api.interceptors.request.use(async (config) => {
  const token = await getSessionToken();

  if (token) {
    const headers = getAuthHeaders(token);
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

export default api;
