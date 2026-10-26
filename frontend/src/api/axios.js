import axios from 'axios';
import { clearStoredUser, getStoredUser } from '../utils/authStorage';

// Normalize URL to always guarantee an '/api' suffix
const envUrl = import.meta.env.VITE_API_URL || 'https://learnai-backend-4ec4.onrender.com/api';
const apiBaseURL = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;

// A hung API must surface as an error, never as an endless spinner. AI routes
// override this with a longer timeout because generation can take ~60s.
const DEFAULT_TIMEOUT_MS = 20000;
const NETWORK_ERROR_MESSAGE =
  'Cannot reach the server right now. Please check your connection and try again.';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: DEFAULT_TIMEOUT_MS,
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
    // No response means timeout, DNS failure, dropped connection or a service
    // that never answered. Replace Axios' technical text with something a
    // student can act on.
    if (!error.response) {
      error.message = NETWORK_ERROR_MESSAGE;
    }

    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      clearStoredUser();
    }
    return Promise.reject(error);
  }
);

export default api;
