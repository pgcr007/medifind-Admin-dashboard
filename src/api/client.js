import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("medifind_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("medifind_admin_token");
      localStorage.removeItem("medifind_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;