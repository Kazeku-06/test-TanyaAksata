import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor — attach token from cookie
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hanya redirect ke login jika ada token (sesi expired),
      // bukan saat request publik yang memang tidak butuh auth.
      const hadToken = !!Cookies.get("auth_token");
      Cookies.remove("auth_token");

      if (hadToken && typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const isAuthPage = pathname === "/login" || pathname === "/register";
        if (!isAuthPage) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
