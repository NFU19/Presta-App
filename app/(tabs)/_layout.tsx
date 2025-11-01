import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Render a stack layout on web and a tab layout on mobile.
  if (Platform.OS === 'web') {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }} />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Inicio'
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          title: 'Catálogo'
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Mi Perfil'
        }}
      />
      <Stack.Screen
        name="favorites"
        options={{
          title: 'Mis Favoritos'
        }}
      />
    </Stack>
  );
}
