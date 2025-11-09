import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Backend URL - Updated with your local IP
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.28:8000/api' 
  : 'https://your-production-api.com/api';

console.log('📡 API Base URL:', API_BASE_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Auth token added to request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('❌ Network Error: No response from server');
      console.error('Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      });
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expired, clear storage
      console.log('🔒 Unauthorized - clearing token');
      await SecureStore.deleteItemAsync('auth_token');
    }
    
    return Promise.reject(error);
  }
);

export default api;
