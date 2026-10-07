import axios from "axios";

const API_BASE_URL = "https://api.payhost.dev";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 30000,
  // PATCH: send and accept payhost_access / payhost_refresh cookies on every request.
  // Without this, the browser will not attach the login cookies and every call looks logged out.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// PATCH: removed the request interceptor that read ACCESS_TOKEN from localStorage
// and set Authorization: Bearer. Web auth is the cookie now. Mobile still sends
// the header itself; this web client must not.

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // PATCH: on 401, refresh via the cookie instead of posting a stored refresh token.
    // Skip refresh and logout URLs so a failed refresh cannot loop.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("token/refresh/") &&
      !originalRequest.url?.includes("logout/")
    ) {
      originalRequest._retry = true;

      try {
        // Empty body: cookie_token_refresh reads payhost_refresh from the cookie.
        await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          {},
          { withCredentials: true }
        );
        // New access cookie is set. Retry the original call; no Authorization header to rewrite.
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh cookie missing or expired. Send the browser to login.
        // Do not touch localStorage; tokens are not stored there anymore.
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;