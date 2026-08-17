import axios from 'axios';
import { clearStoredUser, getStoredUser } from '../utils/authStorage';

const apiBaseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://learnai-backend-4ec4.onrender.com/api');

const api = axios.create({
  baseURL: apiBaseURL,
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
