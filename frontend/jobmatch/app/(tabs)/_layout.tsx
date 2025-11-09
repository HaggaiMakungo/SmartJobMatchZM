import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Briefcase, Bell, User } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

export default function TabsLayout() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  // Theme colors
  const activeColor = '#f29559'; // tangerine
  const inactiveColor = isDarkMode ? '#b8b08d' : '#78704b'; // sage
  const backgroundColor = isDarkMode ? '#202c39' : '#f2d492'; // gunmetal or peach
  const borderColor = isDarkMode ? '#283845' : '#eab84c';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={24} 
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase 
              size={24} 
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Bell 
              size={24} 
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={24} 
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
