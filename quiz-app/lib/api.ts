"use client";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { getAuth } from "@clerk/nextjs/server";
async function fetchMe() {
  const res = await fetch("/api/getToken");
  return res.json();
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
  const token = await fetchMe();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token.token}`;
  }
  return config;
});

export default api;
