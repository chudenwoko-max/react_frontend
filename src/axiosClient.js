import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.payhost.dev/api/",
  headers: {
    "Content-Type": "application/json",
    "X-Client": "web",
    "X-Payhost-Client": "web",
  },
  withCredentials: true,
});

export default axiosClient;
