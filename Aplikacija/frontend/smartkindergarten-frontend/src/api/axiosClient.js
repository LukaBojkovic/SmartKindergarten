import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7001/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token)
    config.headers.Authorization = `Bearer ${token}`;

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) 
    {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;