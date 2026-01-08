import axios from 'axios';
import { Platform } from 'react-native';
import { getCachedApiUrl, initializeNetwork } from '@/config/network';

/**
 * Smart API Client - NO AUTH MODE (Demo)
 * Automatically detects your network and uses the right URL
 */

// Initialize network detection (will be called on app start)
let apiBaseUrl = getCachedApiUrl(); // Get cached or fallback URL immediately

// Create axios instance
export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Initialize API with network detection
 * Call this in your app entry point (App.tsx)
 */
export async function initializeApi() {
  const detectedUrl = await initializeNetwork();
  apiBaseUrl = detectedUrl;
  api.defaults.baseURL = detectedUrl;
  
  console.log('📡 Platform:', Platform.OS);
  console.log('📡 API Base URL:', detectedUrl);
  console.log('🚀 Demo mode - no authentication required');
}

// Request interceptor - NO AUTH (demo mode)
api.interceptors.request.use(
  async (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // No authentication in demo mode
    console.log('🚀 Demo mode: No auth token required');
    
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
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response from server');
      console.error('📍 Attempted URL:', error.config?.baseURL + error.config?.url);
      console.error('💡 Troubleshooting:');
      console.error('   - Is backend running? Check http://localhost:8000/docs');
      console.error('   - Correct network? Current API:', apiBaseUrl);
      console.error('   - Windows Firewall blocking port 8000?');
      console.error('   - Using hotspot (192.168.28.60)?');
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
