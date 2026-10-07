import axios from "axios";

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

let refreshTried = false;

function onLoginPage() {
  return window.location.pathname.startsWith("/login");
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url = error.config?.url || "";

    // _skipRefresh: a failed refresh must not start another refresh.
    if (error.config?._skipRefresh || refreshTried || url.includes("refresh/")) {
      if (!onLoginPage()) window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      refreshTried = true;
      try {
        // Force credentials on this call. got: [] means this request was not credentialed.
        await axiosClient.post(
          "token/refresh/",
          {},
          { _skipRefresh: true, withCredentials: true }
        );
        return axiosClient(error.config);
      } catch (err) {
        if (!onLoginPage()) window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;