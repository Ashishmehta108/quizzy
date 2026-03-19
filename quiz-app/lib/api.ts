"use client";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import { getAuthHeaders } from "@/lib/auth/authService";
import { Contest, ContestDetail, LeaderboardResponse } from "@/lib/types";

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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const contestApi = {
  async getAll(): Promise<Contest[]> {
    const token = await getSessionToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/api/contests`, {
      headers: getAuthHeaders(token || ""),
    });
    const data = await res.json();
    return data.contests || [];
  },

  async getById(id: string): Promise<ContestDetail> {
    const token = await getSessionToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/api/contests/${id}`, {
      headers: getAuthHeaders(token || ""),
    });
    const data = await res.json();
    return data.contest;
  },

  async getLeaderboard(contestId: string): Promise<LeaderboardResponse> {
    const token = await getSessionToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/api/contests/${contestId}/leaderboard`, {
      headers: getAuthHeaders(token || ""),
    });
    const data = await res.json();
    return data;
  },
};
