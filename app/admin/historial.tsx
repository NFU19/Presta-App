import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HistorialEvento {
  id: string;
  usuario: string;
  equipo: string;
  fecha: string;
  tipo: string;
  estado: string;
}

const badgeStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  aprobado: {
    bg: "rgba(16,185,129,0.12)",
    text: "#0f5132",
    border: "rgba(16,185,129,0.32)",
  },
  aceptado: {
    bg: "rgba(16,185,129,0.12)",
    text: "#0f5132",
    border: "rgba(16,185,129,0.32)",
  },
  pendiente: {
    bg: "rgba(251,191,36,0.16)",
    text: "#8a6500",
    border: "rgba(251,191,36,0.32)",
  },
  activo: {
    bg: "rgba(59,130,246,0.14)",
    text: "#1e3a8a",
    border: "rgba(59,130,246,0.32)",
  },
  devuelto: {
    bg: "rgba(107,114,128,0.14)",
    text: "#374151",
    border: "rgba(107,114,128,0.3)",
  },
  rechazado: {
    bg: "rgba(239,68,68,0.14)",
    text: "#991b1b",
    border: "rgba(239,68,68,0.3)",
  },
  vencido: {
    bg: "rgba(239,68,68,0.14)",
    text: "#991b1b",
    border: "rgba(239,68,68,0.3)",
  },
};

const tipoIcon: Record<
  string,
  { name: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Préstamo: { name: "arrow-down-circle", color: "#0A66FF" },
  Devolución: { name: "arrow-up-circle", color: "#16a34a" },
  Rechazo: { name: "close-circle", color: "#dc2626" },
};

const HistorialScreen = () => {
  const [data, setData] = useState<HistorialEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const response = await fetch("http://217.182.64.251:8002/prestamos");
      const result = await response.json();

      // Asegura que siempre sea array
      let prestamos = [];
      if (Array.isArray(result)) {
        prestamos = result;
      } else if (Array.isArray(result.prestamos)) {
        prestamos = result.prestamos;
      }

      // Transforma los datos de la API al formato del historial
      const eventos: HistorialEvento[] = prestamos.map((prestamo: any) => {
        const estado = (
          prestamo.Estado ||
          prestamo.estado ||
          "pendiente"
        ).toLowerCase();
        let tipo = "Préstamo";

        if (estado === "devuelto") {
          tipo = "Devolución";
        } else if (estado === "rechazado") {
          tipo = "Rechazo";
        }

        // Formatea la fecha
        let fechaFormateada = "N/A";
        const fechaSolicitud =
          prestamo.Fecha_Solicitud ||
          prestamo.fechaSolicitud ||
          prestamo.FechaSolicitud;
        if (fechaSolicitud) {
          try {
            const fecha = new Date(fechaSolicitud);
            fechaFormateada = fecha
              .toLocaleDateString("es-MX", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(",", "");
          } catch (e) {
            fechaFormateada = fechaSolicitud;
          }
        }

        return {
          id: (prestamo.Id || prestamo.id || "").toString(),
          usuario:
            prestamo.Email_Usuario ||
            prestamo.usuarioEmail ||
            "Usuario desconocido",
          equipo:
            prestamo.Articulo_Nombre ||
            prestamo.equipoNombre ||
            "Equipo desconocido",
          fecha: fechaFormateada,
          tipo,
          estado,
        };
      });

      // Ordena por fecha más reciente primero
      eventos.sort((a, b) => b.fecha.localeCompare(a.fecha));

      setData(eventos);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const enviarNotificacionPrueba = async () => {
    try {
      // Solicitar permisos si no se han solicitado
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Por favor, habilita los permisos de notificaciones en la configuración de tu dispositivo.",
        );
        return;
      }

      // Programar notificación local de prueba
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Notificación de Prueba",
          body: "¡Las notificaciones están funcionando correctamente! ✅",
          data: { tipo: "prueba", screen: "historial" },
          sound: true,
          badge: 1,
        },
        trigger: {
          seconds: 2, // Se mostrará en 2 segundos
        },
      });

      Alert.alert(
        "Notificación Enviada",
        "Se enviará una notificación de prueba en 2 segundos.",
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error al enviar notificación de prueba:", error);
      Alert.alert(
        "Error",
        "No se pudo enviar la notificación de prueba. Verifica los permisos.",
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View style={styles.headerRow}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="time" size={24} color={Colors.light.primary} />
            <Text style={styles.title}>Historial de Movimientos</Text>
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={enviarNotificacionPrueba}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Probar Notificación</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Registro inmutable de eventos clave (RF-9)
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={Colors.light.gray}
          />
          <Text style={styles.emptyText}>No hay movimientos registrados</Text>
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.1 }]}>ID Transacción</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>Usuario</Text>
            <Text style={[styles.th, { flex: 1.3 }]}>Equipo</Text>
            <Text style={[styles.th, { flex: 1 }]}>Fecha</Text>
            <Text style={[styles.th, { flex: 1 }]}>Tipo de Evento</Text>
            <Text style={[styles.th, { flex: 0.9, textAlign: "right" }]}>
              Estado
            </Text>
          </View>

          {data.map((item, index) => {
            const badge = badgeStyles[item.estado] || badgeStyles.pendiente;
            const iconMeta = tipoIcon[item.tipo] || tipoIcon["Préstamo"];
            return (
              <View key={`${item.id}-${index}`} style={styles.tr}>
                <Text
                  style={[
                    styles.td,
                    { flex: 1.1, fontWeight: "700", color: "#0A2540" },
                  ]}
                >
                  {item.id}
                </Text>
                <Text style={[styles.td, { flex: 1.1 }]} numberOfLines={1}>
                  {item.usuario}
                </Text>
                <Text style={[styles.td, { flex: 1.3 }]} numberOfLines={1}>
                  {item.equipo}
                </Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.fecha}</Text>
                <View style={[styles.tdInline, { flex: 1 }]}>
                  <Ionicons
                    name={iconMeta.name}
                    size={16}
                    color={iconMeta.color}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.td}>{item.tipo}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                      flex: 0.9,
                      justifyContent: "flex-end",
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: badge.text }]}>
                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  headerRow: { gap: 6 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0A2540",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 14,
    marginLeft: 34,
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6edf5",
    ...Platform.select({
      web: { boxShadow: "0 16px 36px rgba(10,37,64,0.08)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e6edf5",
    backgroundColor: "#f7f9fc",
  },
  th: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f6",
    gap: 6,
  },
  td: {
    fontSize: 14,
    color: "#1f2937",
  },
  tdInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.gray,
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.gray,
    marginTop: 16,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HistorialScreen;
