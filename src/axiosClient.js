import axios from "axios";
import * as SecureStore from "expo-secure-store";

const Platform = {
  OS: typeof window !== "undefined" && typeof document !== "undefined" ? "web" : "native",
};

const API_BASE_URL = "https://api.payhost.dev";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Payhost-Client": "web",
  },
});

axiosClient.defaults.headers.common["X-Payhost-Client"] = "web";

// Request interceptor — attaches Bearer token on Android / web
axiosClient.interceptors.request.use(async (config) => {
  const publicPaths = ["register/", "login/", "token/refresh/"];
  const isPublic = publicPaths.some((path) => config.url?.includes(path));

  if (isPublic) {
    delete config.headers.Authorization;
    return config;
  }

  try {
    let token = null;
    if (Platform.OS === "web") {
      token = localStorage.getItem("ACCESS_TOKEN");
    } else {
      token = await SecureStore.getItemAsync("ACCESS_TOKEN");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Failed to attach access token:", e);
  }

  return config;
});

let refreshTried = false;

function onPublicPage() {
  if (Platform.OS !== "web") return false;
  const path = window.location.pathname;
  return path.startsWith("/login")
    || path.startsWith("/forgot-password")
    || path.startsWith("/reset-password")
    || path.startsWith("/register");
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url = error.config?.url || "";

    if (error.config?._skipRefresh || refreshTried || url.includes("refresh/")) {
      if (Platform.OS === "web" && !onPublicPage()) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      refreshTried = true;
      try {
        await axiosClient.post(
          "token/refresh/",
          {},
          { _skipRefresh: true, withCredentials: true }
        );
        return axiosClient(error.config);
      } catch (err) {
        if (Platform.OS === "web" && !onPublicPage()) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;