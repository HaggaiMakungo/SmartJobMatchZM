import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Backend URL Configuration
// 🔧 CHOOSE THE RIGHT URL FOR YOUR SETUP:

// 📱 FOR ANDROID EMULATOR (recommended for testing)
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:8000/api';

// 📱 FOR PHYSICAL DEVICE or EXPO GO (on same WiFi network)
const PHYSICAL_DEVICE_URL = 'http://192.168.1.28:8000/api'; // Your computer's WiFi IP

// 📱 FOR iOS SIMULATOR
const IOS_SIMULATOR_URL = 'http://localhost:8000/api';

// Auto-detect which URL to use
const getApiUrl = () => {
  if (__DEV__) {
    // 📱 FOR EXPO GO - Use your computer's WiFi IP
    return PHYSICAL_DEVICE_URL; // ✅ Using 192.168.1.28
    
    // FOR ANDROID EMULATOR - Use this instead:
    // return ANDROID_EMULATOR_URL;
    
    // UNCOMMENT THE LINE BELOW IF TESTING ON iOS SIMULATOR:
    // return IOS_SIMULATOR_URL;
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiUrl();

console.log('📡 Platform:', Platform.OS);
console.log('📡 API Base URL:', API_BASE_URL);
console.log('💡 If connection fails, check:');
console.log('   1. Backend running? uvicorn app.main:app --reload');
console.log('   2. Right URL? Android Emulator=10.0.2.2, Physical Device=' + PHYSICAL_DEVICE_URL);
console.log('   3. Firewall blocking? Check Windows Firewall settings');

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
    console.log(`🔵 Full URL: ${config.baseURL}${config.url}`);
    
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
      console.error('📍 Attempted URL:', error.config?.baseURL + error.config?.url);
      console.error('💡 Troubleshooting:');
      console.error('   - Is backend running on http://localhost:8000 ?');
      console.error('   - Check: http://localhost:8000/docs in browser');
      console.error('   - Android Emulator? Use 10.0.2.2');
      console.error('   - Physical Device? Use ' + PHYSICAL_DEVICE_URL);
      console.error('   - Windows Firewall blocking port 8000?');
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
