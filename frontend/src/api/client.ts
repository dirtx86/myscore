// frontend/src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mscore_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth state and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mscore_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
