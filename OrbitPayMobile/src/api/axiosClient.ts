import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { singleFlight } from "./singleFlight";

const BASE_URL = "https://currency-cvt-fintech-1.onrender.com/api/";

// ---------------- TOKEN HELPERS ----------------

const getToken = async (key: string) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const saveToken = async (key: string, value: string) => {
  if (Platform.OS === "web") localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

const deleteToken = async (key: string) => {
  if (Platform.OS === "web") localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
};

// ---------------- AXIOS CLIENT ----------------

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ---------------- REQUEST INTERCEPTOR ----------------

axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- REFRESH TOKEN LOGIC ----------------

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getToken("REFRESH_TOKEN");
  if (!refresh) return null;

  const res = await axios.post(
    `${BASE_URL}token/refresh/`,
    { refresh },
    { timeout: 12000 }
  );

  const access = res.data?.access;
  if (access) await saveToken("ACCESS_TOKEN", access);

  return access ?? null;
}

// ---------------- RETRY LOGIC ----------------

function isIdempotentGet(error: AxiosError) {
  const method = (error.config?.method || "get").toLowerCase();
  return method === "get";
}

function shouldRetry(error: AxiosError) {
  if (!error.config) return false;
  if (!isIdempotentGet(error)) return false;

  const retried = (error.config as any).__retried === true;
  if (retried) return false;

  const status = error.response?.status;
  if (status && status < 500 && status !== 429) return false;

  return true;
}

// ---------------- RESPONSE INTERCEPTOR ----------------

axiosClient.interceptors.response.use(
  (res) => res,

  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      __retried?: boolean;
      _retry401?: boolean;
    };

    // ---- 401 → Refresh token ----
    if (error.response?.status === 401 && original && !original._retry401) {
      original._retry401 = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const access = await refreshPromise;
        if (!access) {
          await deleteToken("ACCESS_TOKEN");
          await deleteToken("REFRESH_TOKEN");
          return Promise.reject(error);
        }

        original.headers.Authorization = `Bearer ${access}`;
        return axiosClient(original);
      } catch {
        await deleteToken("ACCESS_TOKEN");
        await deleteToken("REFRESH_TOKEN");
        return Promise.reject(error);
      }
    }

    // ---- Retry GET requests (timeout / 500 / 503 / 429) ----
    if (shouldRetry(error) && original) {
      original.__retried = true;
      await new Promise((r) => setTimeout(r, 400));
      return axiosClient(original);
    }

    return Promise.reject(error);
  }
);

// ---------------- SINGLE-FLIGHT FOR GET ----------------

const rawGet = axiosClient.get.bind(axiosClient);

axiosClient.get = ((url: string, config?: any) => {
  const key = `${url}|${JSON.stringify(config?.params || {})}`;
  return singleFlight(key, () => rawGet(url, config));
}) as typeof axiosClient.get;

export default axiosClient;
