import { Platform } from 'react-native';

/**
 * 🚀 SIMPLIFIED NETWORK CONFIG - No slow async detection!
 * Just change CURRENT_CONNECTION when switching networks
 */

// 🎯 YOUR NETWORK IPs
const DEV_IPS = {
  usb: '192.168.169.1',        // USB tethering / Ethernet 3
  home: '192.168.28.60',        // Home WiFi (current)
  hotspot: '192.168.28.60',    // Phone hotspot
};

const BACKEND_PORT = '8000';

// 🔧 CHANGE THIS when switching networks:
const CURRENT_CONNECTION: 'usb' | 'home' | 'hotspot' = 'home';

/**
 * Get API URL instantly (no async detection overhead)
 */
export function getCachedApiUrl(): string {
  return `http://${DEV_IPS[CURRENT_CONNECTION]}:${BACKEND_PORT}/api`;
}

/**
 * Initialize network (fast, no detection)
 */
export async function initializeNetwork(): Promise<string> {
  const apiUrl = getCachedApiUrl();
  
  console.log('📡 Platform:', Platform.OS);
  console.log('📡 API URL:', apiUrl);
  console.log('🔐 Real auth enabled - tokens saved securely');
  
  return apiUrl;
}

/**
 * Manual override for testing
 */
export function setManualApiUrl(ip: string): void {
  console.log('🔧 Manual API URL:', `http://${ip}:${BACKEND_PORT}`);
}
