// app/admin/prestamos.tsx
// Panel de administración para gestionar solicitudes de préstamos

import { Colors } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import {
    aprobarPrestamoConNotificacion,
    rechazarPrestamoConNotificacion,
} from "../../services/notificacionService";
import { EstadoPrestamo, Prestamo } from "../../types/prestamo";

const PrestamosAdminScreen = () => {
  const [solicitudes, setSolicitudes] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const fetchPrestamos = () => {
    fetch("https://prestaapp.site/prestamos")
      .then((response) => response.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        // Asegura que siempre sea array
        let prestamosArray = [];
        if (Array.isArray(data)) {
          prestamosArray = data;
        } else if (Array.isArray(data.prestamos)) {
          prestamosArray = data.prestamos;
        } else {
          prestamosArray = [];
        }

        // Log del primer préstamo para ver su estructura
        if (prestamosArray.length > 0) {
          console.log("ESTRUCTURA DEL PRIMER PRÉSTAMO:", prestamosArray[0]);
          console.log(
            "KEYS DEL PRIMER PRÉSTAMO:",
            Object.keys(prestamosArray[0]),
          );

          // Verificar que el ID existe
          console.log("Primer ID encontrado:", prestamosArray[0].ID);
          console.log("Estado del primer préstamo:", prestamosArray[0].Estado);
        }

        setSolicitudes(prestamosArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar solicitudes:", error);
        setSolicitudes([]); // evita undefined
        setLoading(false);
      });
  };

  const handleAprobar = async (solicitud: Prestamo) => {
    const adminId = auth.currentUser?.uid;
    if (!adminId) {
      Alert.alert("Error", "No se pudo identificar al administrador");
      return;
    }

    Alert.alert(
      "Aprobar Solicitud",
      "¿Confirmas que deseas aprobar esta solicitud?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aprobar",
          onPress: async () => {
            try {
              setProcessing(true);

              // Extraer el ID correctamente
              const prestamoId = (solicitud as any).ID;

              if (!prestamoId) {
                Alert.alert("Error", "No se pudo obtener el ID del préstamo");
                return;
              }

              const result = await aprobarPrestamoConNotificacion(
                prestamoId,
                adminId,
              );

              if (result.success) {
                Alert.alert(
                  "Solicitud Aprobada",
                  `Se ha aprobado la solicitud y se generó el código QR:\n\n${result.codigoQR}\n\nEl usuario ha recibido una notificación.`,
                );
                fetchPrestamos();
              } else {
                Alert.alert(
                  "Error",
                  result.message || "No se pudo aprobar la solicitud",
                );
              }
            } catch (error: any) {
              console.error("Error al aprobar solicitud:", error);
              Alert.alert("Error", "No se pudo procesar la solicitud.");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleRechazar = async (solicitud: Prestamo) => {
    const adminId = auth.currentUser?.uid;
    if (!adminId) {
      Alert.alert("Error", "No se pudo identificar al administrador");
      return;
    }

    Alert.prompt(
      "Rechazar Solicitud",
      "Ingresa el motivo del rechazo:",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Rechazar",
          onPress: async (motivoRechazo?: string) => {
            if (!motivoRechazo || !motivoRechazo.trim()) {
              Alert.alert("Error", "Debes especificar el motivo del rechazo");
              return;
            }

            try {
              setProcessing(true);

              // Extraer el ID correctamente
              const prestamoId = (solicitud as any).ID;

              if (!prestamoId) {
                Alert.alert("Error", "No se pudo obtener el ID del préstamo");
                return;
              }

              const result = await rechazarPrestamoConNotificacion(
                prestamoId,
                adminId,
                motivoRechazo,
              );

              if (result.success) {
                Alert.alert(
                  "Solicitud Rechazada",
                  "La solicitud ha sido rechazada y el usuario ha recibido una notificación.",
                );
                fetchPrestamos();
              } else {
                Alert.alert(
                  "Error",
                  result.message || "No se pudo rechazar la solicitud",
                );
              }
            } catch (error: any) {
              console.error("Error al rechazar solicitud:", error);
              Alert.alert("Error", "No se pudo procesar la solicitud.");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const getEstadoBadge = (Estado: EstadoPrestamo) => {
    const config = {
      espera: { label: "En espera", color: "#ffc107", icon: "time-outline" },
      pendiente: { label: "Pendiente", color: "#ffc107", icon: "time-outline" },
      "En espera": {
        label: "En espera",
        color: "#ffc107",
        icon: "time-outline",
      },
      aceptado: {
        label: "Aceptado",
        color: "#17a2b8",
        icon: "checkmark-circle-outline",
      },
      denegado: {
        label: "Denegado",
        color: "#dc3545",
        icon: "close-circle-outline",
      },
      activo: {
        label: "Activo",
        color: "#28a745",
        icon: "play-circle-outline",
      },
    };
    const { label, color, icon } =
      config[Estado as keyof typeof config] || config.espera;
    return { label, color, icon };
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";

    // Si es string, convertir a Date
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validar que sea una fecha válida
    if (isNaN(dateObj.getTime())) return "-";

    return dateObj.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracionDias = (solicitud: any): number => {
    try {
      const fechaInicio = solicitud.Fecha_Inicio || solicitud.fechaPrestamo;
      const fechaFin = solicitud.Fecha_Fin || solicitud.fechaDevolucion;

      if (!fechaInicio || !fechaFin) return 0;

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      const diferenciaMilisegundos = fin.getTime() - inicio.getTime();
      const dias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

      return dias > 0 ? dias : 0;
    } catch (error) {
      console.error("Error al calcular duración:", error);
      return 0;
    }
  };

  // PrestamoCard component for mobile view
  const PrestamoCard = ({ solicitud }: { solicitud: Prestamo }) => {
    const { label, color, icon } = getEstadoBadge(solicitud.Estado);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={16} color="#fff" />
            <Text style={styles.badgeText}>{label}</Text>
          </View>
          <Text style={styles.cardId}>
            #{(solicitud as any).Id || solicitud.id}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={Colors.light.gray}
            />
            <Text style={styles.infoText}>{solicitud.Email_Usuario}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="cube-outline"
              size={18}
              color={Colors.light.secondary}
            />
            <Text style={[styles.infoText, styles.equipoText]}>
              {solicitud.Articulo_Nombre}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.light.gray}
            />
            <Text style={styles.infoText}>
              {calcularDuracionDias(solicitud)} días
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={Colors.light.gray}
            />
            <Text style={styles.infoText}>{solicitud.Proposito}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={Colors.light.gray} />
            <Text style={styles.infoTextSmall}>
              Solicitado: {formatDate(solicitud.Fecha_Solicitud)}
            </Text>
          </View>
        </View>

        {(solicitud.Estado === "espera" ||
          solicitud.Estado === "pendiente" ||
          solicitud.Estado === "En espera") && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAprobar(solicitud)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRechazar(solicitud)}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {solicitud.Estado === "aceptado" && solicitud.codigoQR && (
          <View style={styles.qrInfo}>
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={Colors.light.secondary}
            />
            <Text style={styles.qrText}>Código QR: {solicitud.codigoQR}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={[styles.header, (isMobile || isTablet) && styles.headerMobile]}
      >
        <View>
          <Text
            style={[styles.title, (isMobile || isTablet) && styles.titleMobile]}
          >
            Gestión de Préstamos
          </Text>
          <Text
            style={[
              styles.subtitle,
              (isMobile || isTablet) && styles.subtitleMobile,
            ]}
          >
            {Array.isArray(solicitudes)
              ? solicitudes
                  .filter(
                    (s) =>
                      s.Estado === "espera" ||
                      s.Estado === "pendiente" ||
                      s.Estado === "En espera",
                  )
                  .length.toString()
              : "0"}{" "}
            solicitudes en espera
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.light.secondary}
          style={styles.loader}
        />
      ) : solicitudes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="folder-open-outline"
            size={64}
            color={Colors.light.gray}
          />
          <Text style={styles.emptyText}>
            No hay solicitudes en este momento
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.cardsContainer,
            (isMobile || isTablet) && styles.cardsContainerMobile,
          ]}
        >
          {solicitudes.map((solicitud, index) => (
            <PrestamoCard
              key={(solicitud as any).ID || index}
              solicitud={solicitud}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  header: {
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerMobile: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  subtitleMobile: {
    fontSize: 13,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.gray,
    marginTop: 16,
  },
  cardsContainer: {
    padding: 16,
  },
  cardsContainerMobile: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardId: {
    fontSize: 12,
    color: Colors.light.gray,
    fontFamily: "monospace",
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  infoTextSmall: {
    fontSize: 12,
    color: Colors.light.gray,
    flex: 1,
  },
  equipoText: {
    fontWeight: "600",
    color: Colors.light.secondary,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#28a745",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  qrInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  qrText: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: "monospace",
    flex: 1,
  },
});

export default PrestamosAdminScreen;
