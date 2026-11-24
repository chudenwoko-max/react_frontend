// axiosClient.js

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.payhost.dev/api/",
  withCredentials: true,
  headers: {
    "X-Client": "web",
    "X-Payhost-Client": "web",
  },
});

axiosClient.defaults.xsrfCookieName = "csrftoken";
axiosClient.defaults.xsrfHeaderName = "X-CSRFToken";
axiosClient.defaults.withXSRFToken = true;

export default axiosClient;