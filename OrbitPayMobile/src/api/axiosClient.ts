import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://currency-cvt-fintech-1.onrender.com";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 15000,
});

// Helper to get token (works on both web and mobile)
const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("ACCESS_TOKEN");
  }
  return await SecureStore.getItemAsync("ACCESS_TOKEN");
};

axiosClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;