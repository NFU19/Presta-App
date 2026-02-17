// app/admin/prestamos.tsx
// Panel de administración para gestionar solicitudes de préstamos

import { Colors } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import {
  aprobarSolicitudPrestamo,
  rechazarSolicitudPrestamo,
} from "../../services/prestamoService";
import { EstadoPrestamo, Prestamo } from "../../types/prestamo";

const PrestamosAdminScreen = () => {
  const [solicitudes, setSolicitudes] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Prestamo | null>(
    null,
  );
  const [notas, setNotas] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [actionType, setActionType] = useState<"aprobar" | "rechazar">(
    "aprobar",
  );
  const [processing, setProcessing] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const [usuarios, setUsuarios] = useState<any[]>([]); // Para mostrar nombre/email en lugar de ID
  const [articulos, setArticulos] = useState<any[]>([]); // Para mostrar nombre/email en lugar de ID

  useEffect(() => {
    fetchPrestamos();
    fetchUsuarios();
    fetchArticulos();
  }, []);

  const fetchPrestamos = () => {
    fetch("http://217.182.64.251:8002/prestamos")
      .then((response) => response.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        // Asegura que siempre sea array
        if (Array.isArray(data)) {
          setSolicitudes(data);
        } else if (Array.isArray(data.prestamos)) {
          setSolicitudes(data.prestamos);
        } else {
          setSolicitudes([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar solicitudes:", error);
        setSolicitudes([]); // evita undefined
        setLoading(false);
      });
  };

  const fetchUsuarios = () => {
    fetch("http://217.182.64.251:8002/usuarios")
      .then((response) => response.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        // Asegura que siempre sea array
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else if (Array.isArray(data.usuarios)) {
          setUsuarios(data.usuarios);
        } else {
          setUsuarios([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
        setUsuarios([]); // evita undefined
        setLoading(false);
      });
  };

  const fetchArticulos = () => {
    fetch("http://217.182.64.251:8002/articulos")
      .then((response) => response.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        // Asegura que siempre sea array
        if (Array.isArray(data)) {
          setArticulos(data);
        } else if (Array.isArray(data.Articulos)) {
          setArticulos(data.Articulos);
        } else {
          setArticulos([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar Articulos:", error);
        setArticulos([]); // evita undefined
        setLoading(false);
      });
  };

  const handleAprobar = (solicitud: Prestamo) => {
    setSelectedSolicitud(solicitud);
    setActionType("aprobar");
    setNotas("");
    setModalVisible(true);
  };

  const handleRechazar = (solicitud: Prestamo) => {
    setSelectedSolicitud(solicitud);
    setActionType("rechazar");
    setMotivoRechazo("");
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedSolicitud) return;

    const adminId = auth.currentUser?.uid;
    if (!adminId) {
      Alert.alert("Error", "No se pudo identificar al administrador");
      return;
    }

    if (actionType === "rechazar" && !motivoRechazo.trim()) {
      Alert.alert("Error", "Debes especificar el motivo del rechazo");
      return;
    }

    try {
      setProcessing(true);

      if (actionType === "aprobar") {
        const codigoQR = await aprobarSolicitudPrestamo(
          selectedSolicitud.id,
          adminId,
          notas,
        );
        Alert.alert(
          "✅ Solicitud Aprobada",
          `Se ha aprobado la solicitud y se generó el código QR:\n\n${codigoQR}\n\nEl usuario recibirá una notificación.`,
        );
      } else {
        await rechazarSolicitudPrestamo(
          selectedSolicitud.id,
          adminId,
          motivoRechazo,
        );
        Alert.alert(
          "❌ Solicitud Rechazada",
          "La solicitud ha sido rechazada y el equipo está nuevamente disponible.",
        );
      }

      setModalVisible(false);
      setSelectedSolicitud(null);
      setNotas("");
      setMotivoRechazo("");
    } catch (error: any) {
      console.error("Error al procesar solicitud:", error);
      Alert.alert(
        "Error",
        "No se pudo procesar la solicitud. Intenta de nuevo.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const getEstadoBadge = (Estado: EstadoPrestamo) => {
    const config = {
      pendiente: { label: "Pendiente", color: "#ffc107", icon: "time-outline" },
      aceptado: {
        label: "Aceptado",
        color: "#17a2b8",
        icon: "checkmark-circle-outline",
      },
      activo: {
        label: "Activo",
        color: "#28a745",
        icon: "play-circle-outline",
      },
    };
    const { label, color, icon } =
      config[Estado as keyof typeof config] || config.pendiente;
    return { label, color, icon };
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <Text style={styles.cardId}>#{solicitud.id}</Text>
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
            <Text style={styles.infoText}>{solicitud.duracionDias} días</Text>
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
              Solicitado: {formatDate(solicitud.fechaSolicitud)}
            </Text>
          </View>
        </View>

        {solicitud.Estado === "pendiente" && (
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
                  .filter((s) => s.Estado === "pendiente")
                  .length.toString()
              : "0"}{" "}
            solicitudes pendientes
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
          {solicitudes.map((solicitud) => (
            <PrestamoCard key={solicitud.id} solicitud={solicitud} />
          ))}
        </View>
      )}

      {/* Modal de Confirmación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === "aprobar"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </Text>

            {actionType === "aprobar" ? (
              <>
                <Text style={styles.modalText}>
                  ¿Confirmas que deseas aprobar esta solicitud?
                </Text>
                <Text style={styles.modalSubtext}>
                  Se generará un código QR y se notificará al usuario.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Notas adicionales (opcional)"
                  value={notas}
                  onChangeText={setNotas}
                  multiline
                  numberOfLines={3}
                />
              </>
            ) : (
              <>
                <Text style={styles.modalText}>
                  ¿Por qué deseas rechazar esta solicitud?
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Motivo del rechazo (requerido)"
                  value={motivoRechazo}
                  onChangeText={setMotivoRechazo}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  actionType === "aprobar"
                    ? styles.confirmButton
                    : styles.rejectModalButton,
                  processing && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={
                  processing ||
                  (actionType === "rechazar" && !motivoRechazo.trim())
                }
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {actionType === "aprobar" ? "Aprobar" : "Rechazar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 13,
    color: Colors.light.gray,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  rejectModalButton: {
    backgroundColor: "#dc3545",
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PrestamosAdminScreen;
