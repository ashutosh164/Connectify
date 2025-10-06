import axios from "axios";
import { API_BASE_URL } from "./config";

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor (for auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor (for handling errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Example: redirect to login if unauthorized
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
