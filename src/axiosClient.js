import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.0.187:8000";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// Attach access token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh expired tokens
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("REFRESH_TOKEN");

      if (!refresh) {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("ACCESS_TOKEN", newAccess);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.log("REFRESH FAILED:", refreshError.response?.data);

        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;