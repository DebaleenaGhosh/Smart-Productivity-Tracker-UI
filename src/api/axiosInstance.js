import axios from "axios";
import { clearSession, getSession } from "../utils/session";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

function isPublicAuthRequest(config) {
  const path = new URL(config.url || "", "http://localhost").pathname;
  return /\/auth\/(login|register)\/?$/.test(path);
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = isPublicAuthRequest(config) ? null : getSession()?.token;
    config.headers = axios.AxiosHeaders.from(config.headers);
    // Record the actual session used so a late 401 cannot clear a newer login.
    config.sessionToken = token || null;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestToken = error.config?.sessionToken;
    if (error.response?.status === 401 && requestToken &&
        !isPublicAuthRequest(error.config) && getSession()?.token === requestToken) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
