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

// Every axiosClient call, including login and verify-2fa, sends this.
axiosClient.defaults.headers.common["X-Payhost-Client"] = "web";

// One failed refresh ends it. The API cannot cancel the next browser call.
let refreshTried = false;

function onLoginPage() {
  return window.location.pathname.startsWith("/login");
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url = error.config?.url || "";

    // refresh/ 400, or a second 401 after we already tried: stop. Do not post refresh again.
    if (refreshTried || url.includes("refresh/")) {
      if (!onLoginPage()) window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      refreshTried = true;
      try {
        // Raw axios does not inherit axiosClient defaults, so set the header here too.
        await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          {},
          {
            withCredentials: true,
            headers: { "X-Payhost-Client": "web" },
          }
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