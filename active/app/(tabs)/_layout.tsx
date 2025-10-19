import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
// IMPORT the new CustomHeader component
import CustomHeader from '@/components/CustomHeader'; 

// Import the necessary components that are still used
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Define the header configuration once for explicit use on each screen
// This ensures that the CustomHeader is used and correctly positioned (transparent) on all tabs.
const defaultHeaderOptions = {
    headerShown: true,
    headerTransparent: true,
    header: () => <CustomHeader />,
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="comparison"
          options={{
            title: 'Comparison',
            tabBarIcon: ({ color }) => <IconSymbol name="arrow.triangle.2.circlepath.circle.fill" size={28} color={color} />,
            ...defaultHeaderOptions, // <-- Apply explicit header config
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Community',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
            ...defaultHeaderOptions, // <-- Apply explicit header config
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            ...defaultHeaderOptions, // <-- Apply explicit header config
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
            ...defaultHeaderOptions, // <-- Apply explicit header config
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper.fill" color={color} />,
            ...defaultHeaderOptions, // <-- Apply explicit header config
          }}
        />
      </Tabs>
    </View>
  );
}
