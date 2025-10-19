import { Stack } from 'expo-router';

// This file defines the navigation options for all routes in the /app/product directory.
export default function ProductLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="pesticideDetails" 
        options={{ 
          title: "Product Details", // Default title, overridden by headerTitle if set
          headerShown: true,
          headerBackTitle: '',
        }} 
      />
      <Stack.Screen 
        name="addProducts" 
        options={{ 
          title: "Add Product",
          headerShown: true,
          headerBackTitle: '',
        }} 
      />
    </Stack>
  );
}