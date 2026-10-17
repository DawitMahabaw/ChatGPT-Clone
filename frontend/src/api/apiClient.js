import axios from "axios";

// Normalize base URL to prevent duplicate /api suffixes
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const baseURL = rawUrl.replace(/\/api\/?$/, "");

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("chatgpt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle unauthorized errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized or 403 Forbidden, token might be invalid
    if (error.response?.status === 401 && localStorage.getItem("chatgpt_token")) {
      // Don't auto-clear if user was on guest mode
    }
    return Promise.reject(error);
  },
);

export default apiClient;
