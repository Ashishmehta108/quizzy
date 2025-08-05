import axios from "axios";


export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL!,
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

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
