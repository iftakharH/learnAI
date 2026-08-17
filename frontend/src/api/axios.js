import axios from 'axios';
import { clearStoredUser, getStoredUser } from '../utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://learnai-backend-4ec4.onrender.com/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredUser();
    }
    return Promise.reject(error);
  }
);

export default api;
