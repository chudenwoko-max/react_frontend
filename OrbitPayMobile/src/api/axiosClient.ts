import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { singleFlight } from "./singleFlight";
import { DeviceEventEmitter } from "react-native";

// CHANGE: product name is Payhost. Importers of these constants do not need a call-site edit.
export const API_UNREACHABLE = "payhost:api-unreachable";
export const API_REACHABLE = "payhost:api-reachable";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api.payhost.dev/api/";

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
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    // CHANGE: login already sent this per call. Default it so wallet calls send it too.
    "X-Client": "mobile",
  },
});

// ---------------- REQUEST INTERCEPTOR ----------------

axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CHANGE: money routes require Idempotency-Key. Screens keep storing reference_id; copy it when the header is absent.
  if (!config.headers["Idempotency-Key"]) {
    let body = config.data;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = null;
      }
    }
    const key = (config as { idempotencyKey?: string }).idempotencyKey || body?.reference_id;
    if (key) config.headers["Idempotency-Key"] = key;
  }

  return config;
});

// ---------------- REFRESH TOKEN LOGIC ----------------

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getToken("REFRESH_TOKEN");
  if (!refresh) return null;

  const res = await axios.post(
    `${baseURL}token/refresh/`,
    { refresh },
    { timeout: 30000 }
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
  (res) => {
    DeviceEventEmitter.emit(API_REACHABLE);
    return res;
  },

  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      __retried?: boolean;
      _retry401?: boolean;
    };

    // ---- API Reachability Signals ----
    const noResponse = !error.response;
    const timedOut = error.code === "ECONNABORTED";
    const status = error.response?.status;

    if (noResponse || timedOut || (status && status >= 500)) {
      DeviceEventEmitter.emit(API_UNREACHABLE);
    } else if (status && status < 500) {
      DeviceEventEmitter.emit(API_REACHABLE);
    }

    // ---- 401 → Refresh token ----
    if (status === 401 && original && !original._retry401) {
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
    // CHANGE: POST is not retried here. A money retry must reuse the same Idempotency-Key from the screen helper.
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