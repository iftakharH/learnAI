import axios from 'axios';
import { clearStoredUser, getStoredUser } from '../utils/authStorage';

// Normalize URL to always guarantee an '/api' suffix
const envUrl = import.meta.env.VITE_API_URL || 'https://learnai-backend-4ec4.onrender.com/api';
const apiBaseURL = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
});

const isAuthRequest = (url = '') => url.includes('/auth/login') || url.includes('/auth/register');

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    if (user?.token) {
      if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${user.token}`);
      } else {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
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
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      clearStoredUser();
    }
    return Promise.reject(error);
  }
);

export default api;