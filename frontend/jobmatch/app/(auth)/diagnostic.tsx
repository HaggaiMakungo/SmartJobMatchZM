import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const BACKEND_IP = '192.168.1.28';
const BACKEND_PORT = '8000';

export default function NetworkDiagnostic() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Check if we can reach the server at all
    log('🔍 Test 1: Checking base server connectivity...');
    try {
      const response = await axios.get(`http://${BACKEND_IP}:${BACKEND_PORT}/health`, {
        timeout: 5000,
      });
      log(`✅ Test 1 PASSED: Server is reachable! Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      log(`❌ Test 1 FAILED: Cannot reach server`);
      log(`Error: ${error.message}`);
      if (error.code) log(`Error Code: ${error.code}`);
    }

    // Test 2: Check API health endpoint
    log('\n🔍 Test 2: Checking API health endpoint...');
    try {
      const response = await axios.get(`http://${BACKEND_IP}:${BACKEND_PORT}/api/health`, {
        timeout: 5000,
      });
      log(`✅ Test 2 PASSED: API is healthy! Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      log(`❌ Test 2 FAILED: API health check failed`);
      log(`Error: ${error.message}`);
    }

    // Test 3: Test auth endpoint (OPTIONS request - CORS preflight)
    log('\n🔍 Test 3: Checking CORS for auth endpoint...');
    try {
      const response = await axios.options(`http://${BACKEND_IP}:${BACKEND_PORT}/api/auth/login`, {
        timeout: 5000,
      });
      log(`✅ Test 3 PASSED: CORS is configured correctly`);
    } catch (error: any) {
      log(`⚠️ Test 3 WARNING: CORS check failed (might be ok)`);
      log(`Error: ${error.message}`);
    }

    // Test 4: Try actual login with test credentials
    log('\n🔍 Test 4: Testing login endpoint with test user...');
    try {
      const formData = new FormData();
      formData.append('username', 'brian.mwale@example.com');
      formData.append('password', 'password123');

      const response = await axios.post(
        `http://${BACKEND_IP}:${BACKEND_PORT}/api/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 5000,
        }
      );
      log(`✅ Test 4 PASSED: Login successful!`);
      log(`Token received: ${response.data.access_token.substring(0, 20)}...`);
      log(`User: ${response.data.user.full_name} (${response.data.user.email})`);
    } catch (error: any) {
      log(`❌ Test 4 FAILED: Login failed`);
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Response: ${JSON.stringify(error.response.data)}`);
      } else {
        log(`Error: ${error.message}`);
      }
    }

    setTesting(false);
    log('\n✅ Diagnostic complete!');
  };

  const testConnectionSimple = async () => {
    try {
      const response = await axios.get(`http://${BACKEND_IP}:${BACKEND_PORT}/health`, {
        timeout: 3000,
      });
      Alert.alert('Success!', `Server is running: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      Alert.alert('Error', `Cannot connect to server: ${error.message}`);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Card className="mb-4">
        <Text className="text-xl font-bold text-primary mb-2">
          Network Diagnostic Tool
        </Text>
        <Text className="text-gray-600 mb-4">
          Testing connection to: {BACKEND_IP}:{BACKEND_PORT}
        </Text>

        <Button
          variant="tangerine"
          onPress={runTests}
          disabled={testing}
          className="mb-2"
        >
          <Text className="text-white font-semibold">
            {testing ? 'Running Tests...' : 'Run Full Diagnostic'}
          </Text>
        </Button>

        <Button
          variant="outline"
          onPress={testConnectionSimple}
          disabled={testing}
        >
          <Text className="text-primary font-semibold">
            Quick Connection Test
          </Text>
        </Button>
      </Card>

      {results.length > 0 && (
        <Card className="bg-gray-900 p-4">
          <Text className="text-white font-mono text-xs">
            {results.join('\n')}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
