import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACK_URL! + "/api",
  withCredentials: true,
});
export const getToken = async () => {
  const t = await fetch(`/api/cookie`);
  const { token } = await t.json();
  return token;
};

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
  const token = await getToken();
  const { userId } = useAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-User-Id"] = userId;
  return config;
});

export default api;
