import { config } from "@/config";
import axios from "axios";

const api = axios.create({
  baseURL: config.server_url,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
