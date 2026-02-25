import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import { VpsUserProvider, useVpsUser } from "@/contexts/VpsUserContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotifications } from "@/hooks/use-notifications";

export const unstable_settings = {
  initialRouteName: "login",
};

/**
 * Componente interno que maneja las notificaciones
 */
function AppContent() {
  const colorScheme = useColorScheme();
  const { vpsUserId } = useVpsUser();
  
  // Inicializar notificaciones cuando hay un usuario logueado
  const { notificacionesNoLeidas } = useNotifications(
    vpsUserId ? parseInt(vpsUserId) : null
  );

  // Log para debug (opcional)
  useEffect(() => {
    if (vpsUserId && notificacionesNoLeidas > 0) {
      console.log(`📬 ${notificacionesNoLeidas} notificaciones no leídas`);
    }
  }, [notificacionesNoLeidas, vpsUserId]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="forgot-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="product-details"
          options={{ presentation: "modal", title: "Detalles" }}
        />
        <Stack.Screen
          name="loan-request-modal"
          options={{ presentation: "modal", title: "Solicitar" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "modal", title: "Notificaciones" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <VpsUserProvider>
      <AppContent />
    </VpsUserProvider>
  );
}
