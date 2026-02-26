// services/notificacionService.ts
// Servicio para manejar notificaciones push y locales

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { API_CONFIG, buildUrl } from "../constants/api";
import {
    Notificacion,
    NotificacionLocal,
    RegistrarTokenData,
} from "../types/notificacion";

/**
 * Configuración de cómo se mostrarán las notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permisos para notificaciones push
 */
export const solicitarPermisosNotificaciones = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      console.warn(
        "Las notificaciones push solo funcionan en dispositivos físicos",
      );
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("No se otorgaron permisos para notificaciones");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al solicitar permisos de notificaciones:", error);
    return false;
  }
};

/**
 * Crea un AbortSignal con timeout para React Native
 * (AbortSignal.timeout no está disponible en Hermes)
 */
const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
};

/**
 * Obtiene el token de Expo Push Notifications
 */
export const obtenerExpoPushToken = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      console.warn("No se puede obtener token en simulador");
      return null;
    }

    // El projectId se obtiene automáticamente de app.json
    const token = await Notifications.getExpoPushTokenAsync();

    return token.data;
  } catch (error) {
    console.error("Error al obtener Expo push token:", error);
    return null;
  }
};

/**
 * Registra el token push del usuario en el backend
 */
export const registrarTokenPush = async (
  usuarioId: number,
  pushToken: string,
): Promise<boolean> => {
  try {
    const dispositivo = {
      plataforma: Platform.OS,
      modelo: Device.modelName || undefined,
      version: Device.osVersion || undefined,
    };

    const data: RegistrarTokenData = {
      usuarioId,
      pushToken,
      dispositivo,
    };

    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.USUARIO_PUSH_TOKEN),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    if (!response.ok) {
      console.error("Error al registrar token push:", response.status);
      return false;
    }

    console.log("Token push registrado exitosamente");
    return true;
  } catch (error) {
    console.error("Error al registrar token push en el backend:", error);
    return false;
  }
};

/**
 * Inicializa el sistema de notificaciones para un usuario
 */
export const inicializarNotificaciones = async (
  usuarioId: number,
): Promise<string | null> => {
  try {
    // 1. Solicitar permisos
    const permisosConcedidos = await solicitarPermisosNotificaciones();
    if (!permisosConcedidos) {
      return null;
    }

    // 2. Obtener token
    const pushToken = await obtenerExpoPushToken();
    if (!pushToken) {
      return null;
    }

    // 3. Registrar token en el backend
    await registrarTokenPush(usuarioId, pushToken);

    // 4. Configurar canal de notificaciones para Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificaciones de Préstamos",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });
    }

    return pushToken;
  } catch (error) {
    console.error("Error al inicializar notificaciones:", error);
    return null;
  }
};

/**
 * Obtiene las notificaciones del usuario desde el backend
 */
export const obtenerNotificacionesUsuario = async (
  usuarioId: number,
): Promise<Notificacion[]> => {
  try {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.NOTIFICACIONES_USUARIO(usuarioId)),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    if (!response.ok) {
      console.error("Error al obtener notificaciones:", response.status);
      return [];
    }

    const notificaciones: Notificacion[] = await response.json();

    // Ordenar por fecha (más recientes primero)
    return notificaciones.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error("Error al obtener notificaciones del backend:", error);
    return [];
  }
};

/**
 * Marca una notificación como leída
 */
export const marcarNotificacionLeida = async (
  notificacionId: number,
): Promise<boolean> => {
  try {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.MARCAR_LEIDA(notificacionId)),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return false;
  }
};

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export const marcarTodasLeidas = async (
  usuarioId: number,
): Promise<boolean> => {
  try {
    const response = await fetch(
      buildUrl(
        `${API_CONFIG.ENDPOINTS.NOTIFICACIONES_USUARIO(usuarioId)}/leer-todas`,
      ),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error);
    return false;
  }
};

/**
 * Muestra una notificación local inmediata
 */
export const mostrarNotificacionLocal = async (
  notificacion: NotificacionLocal,
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificacion.titulo,
        body: notificacion.mensaje,
        data: notificacion.datos || {},
        sound: notificacion.sound !== false,
        priority: notificacion.priority || "high",
        vibrate:
          notificacion.vibrate !== false ? [0, 250, 250, 250] : undefined,
      },
      trigger: null, // null = inmediato
    });
  } catch (error) {
    console.error("Error al mostrar notificación local:", error);
  }
};

/**
 * Programa una notificación local para más tarde
 */
export const programarNotificacionLocal = async (
  notificacion: NotificacionLocal,
  segundos: number,
): Promise<string | null> => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificacion.titulo,
        body: notificacion.mensaje,
        data: notificacion.datos || {},
        sound: notificacion.sound !== false,
      },
      trigger: {
        seconds: segundos,
      },
    });

    return id;
  } catch (error) {
    console.error("Error al programar notificación:", error);
    return null;
  }
};

/**
 * Cancela todas las notificaciones programadas
 */
export const cancelarTodasLasNotificaciones = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error al cancelar notificaciones:", error);
  }
};

/**
 * Obtiene el badge count (número de notificaciones pendientes)
 */
export const obtenerBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error("Error al obtener badge count:", error);
    return 0;
  }
};

/**
 * Establece el badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Error al establecer badge count:", error);
  }
};

/**
 * Limpia el badge count
 */
export const limpiarBadgeCount = async (): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error("Error al limpiar badge count:", error);
  }
};

/**
 * Aprueba un préstamo y envía notificación al usuario
 */
export const aprobarPrestamoConNotificacion = async (
  prestamoId: string | number,
  adminId: string,
  notas?: string,
): Promise<{ success: boolean; codigoQR?: string; message?: string }> => {
  try {
    const fechaAprobacion = new Date().toISOString();

    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.ACTUALIZAR_PRESTAMO(Number(prestamoId))),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(prestamoId),
          estado: "aceptado",
          fecha_aprobacion: fechaAprobacion,
        }),
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Error al aprobar el préstamo",
      };
    }

    const result = await response.json().catch(() => ({}));
    // Generar un código QR temporal si el backend no lo devuelve
    const codigoQR =
      result.codigoQR ||
      result.Codigo_QR ||
      `PRESTAMO-${prestamoId}-${Date.now()}`;
    return { success: true, codigoQR };
  } catch (error) {
    console.error("Error al aprobar préstamo:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
};

/**
 * Rechaza un préstamo y envía notificación al usuario
 */
export const rechazarPrestamoConNotificacion = async (
  prestamoId: string | number,
  adminId: string,
  motivoRechazo: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const fechaAprobacion = new Date().toISOString();

    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.ACTUALIZAR_PRESTAMO(Number(prestamoId))),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(prestamoId),
          estado: "rechazado",
          fecha_aprobacion: fechaAprobacion,
        }),
        signal: createTimeoutSignal(API_CONFIG.TIMEOUT),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Error al rechazar el préstamo",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al rechazar préstamo:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
};

// Tipos de listeners para exportar
export type NotificationListener = ReturnType<
  typeof Notifications.addNotificationReceivedListener
>;
export type NotificationResponseListener = ReturnType<
  typeof Notifications.addNotificationResponseReceivedListener
>;
