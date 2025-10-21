import axios from 'axios';
import { API_URL } from '../config/constants';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor - Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Network error
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default API;

