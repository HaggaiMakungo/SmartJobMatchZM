import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/authStore";
import { initializeApi } from "@/services/api";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { loadAuth } = useAuthStore();

  // Load auth state and initialize network on app start
  useEffect(() => {
    const initialize = async () => {
      // Initialize smart network detection
      await initializeApi();
      // Load auth state (if user already selected a role)
      loadAuth();
    };
    
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          {/* Role selection screen (entry point) */}
          <Stack.Screen name="index" />
          
          {/* Auth screens (not used in NO AUTH MODE) */}
          <Stack.Screen name="(auth)" />
          
          {/* Job Seeker tabs */}
          <Stack.Screen name="(tabs)" />
          
          {/* Employer tabs */}
          <Stack.Screen name="(employer)" />
          
          {/* Other screens */}
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="employer-type" />
          <Stack.Screen name="job-details" />
          <Stack.Screen name="application-form" />
          <Stack.Screen name="edit-profile" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
