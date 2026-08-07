import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public endpoints that should NEVER send a token
const publicEndpoints = [
  '/2fa/login/',
  '/login/',
  '/register/',
  '/auth/login/',
  '/auth/register/',
  '/token/',
  '/token/refresh/',
  '/password-reset/',
];

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  // Only attach token if it exists AND the endpoint is not public
  const isPublic = publicEndpoints.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;