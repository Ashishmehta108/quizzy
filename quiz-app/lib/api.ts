import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
export const getToken = async () => {
  const t = await fetch(new URL("http://localhost:3000/api/cookie"));
  const { token } = await t.json();
  return token;
};

export const deleteToken = async () => {
  const t = await fetch("/api/cookie", {
    method: "DELETE",
  });
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
