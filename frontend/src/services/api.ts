import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // Use relative path for production (proxied by Nginx)
  baseURL: '/api',
});

// Automatically inject JWT token into request headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('collabryx_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
