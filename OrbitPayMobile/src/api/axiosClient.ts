import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://currency-cvt-fintech-1.onrender.com";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helpers
const getToken = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const deleteToken = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Attach access token
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Error reading token:", e);
  }
  return config;
});

// Handle 401 + refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await getToken("REFRESH_TOKEN");

        if (!refresh) {
          await deleteToken("ACCESS_TOKEN");
          await deleteToken("REFRESH_TOKEN");
          return Promise.reject(error);
        }

        const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh,
        });

        const newAccess = res.data.access;

        if (Platform.OS === "web") {
          localStorage.setItem("ACCESS_TOKEN", newAccess);
        } else {
          await SecureStore.setItemAsync("ACCESS_TOKEN", newAccess);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        await deleteToken("ACCESS_TOKEN");
        await deleteToken("REFRESH_TOKEN");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;