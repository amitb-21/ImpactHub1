import axios from 'axios';
import { API_URL } from '../config/constants';
import { toast } from 'react-toastify';

console.log('API URL:', API_URL); // Debug log
// Prevent spamming the user with the same "server down" toast repeatedly
let serverDownToastShown = false;

const API = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't reject responses with status < 500
  }
});

// Request interceptor - Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found.');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    // For responses with a body (server returned an HTTP status), show the server message
    if (error.response) {
      console.error('API Error Response:', error.response);
      const serverMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
      // Show server-provided message for non-handled statuses
      if (![401, 403, 404, 500].includes(error.response.status)) {
        toast.error(serverMessage);
      }
      return Promise.reject(error);
    }

    // Network error (no response received)
    console.error('Network Error Details:', {
      message: error.message,
      config: error.config,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });

    // Avoid showing the same server-down toast for every failed request.
    // Show at most one such toast every 30 seconds.
    if (!serverDownToastShown) {
      serverDownToastShown = true;

      // Quick probe to check base API reachability. If probe resolves, the
      // problem is the endpoint; otherwise backend appears down.
      fetch(API_URL)
        .then(() => {
          toast.error(
            'Network error. API server is reachable but the request failed. Check server logs or the specific endpoint.'
          );
        })
        .catch(() => {
          toast.error(`Cannot reach server at ${API_URL}. Please check if backend is running.`);
        })
        .finally(() => {
          // Reset the flag after 30s so the user can be notified again if the
          // problem persists later.
          setTimeout(() => {
            serverDownToastShown = false;
          }, 30000);
        });
    }

    return Promise.reject(error);
  }
);

export default API;

