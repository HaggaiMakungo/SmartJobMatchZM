import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Home, Briefcase, Bell, User } from 'lucide-react-native';

export default function EmployerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f29559', // tangerine
        tabBarInactiveTintColor: '#b8b08d', // sage
        tabBarStyle: {
          backgroundColor: '#202c39', // primary/gunmetal
          borderTopColor: '#283845',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            focused ? 
              <Home size={24} color={color} strokeWidth={2.5} fill={color} /> :
              <Home size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            focused ?
              <Bell size={24} color={color} strokeWidth={2.5} fill={color} /> :
              <Bell size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
