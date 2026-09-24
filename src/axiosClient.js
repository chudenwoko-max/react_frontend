import axios from "axios";

const API_BASE_URL = "https://api.payhost.dev";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = async (key) => localStorage.getItem(key);

const deleteToken = async (key) => {
  localStorage.removeItem(key);
};

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
        localStorage.setItem("ACCESS_TOKEN", newAccess);
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