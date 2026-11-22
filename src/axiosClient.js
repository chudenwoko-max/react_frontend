const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.payhost.dev/api/",
  headers: {
    "Content-Type": "application/json",
    "X-Client": "web",
    "X-Payhost-Client": "web",
  },
  withCredentials: true,
});

export default axiosClient;
