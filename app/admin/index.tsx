import { Colors } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  DimensionValue,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface Prestamo {
  id: string;
  equipoNombre: string;
  usuarioNombre: string;
  estado: string;
  fechaSolicitud: any;
  fechaAprobacion?: any;
  fechaDevolucionEsperada?: any;
  proposito?: string;
  // Campos de la API
  ID?: number;
  "ID Articulo"?: number;
  "ID Usuario"?: number;
  Estado?: string;
  "Fecha Solicitud"?: string;
  "Fecha Inicio"?: string;
  "Fecha Fin"?: string;
  Proposito?: string;
  Nota?: string;
  QR?: any;
}

interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  tipo?: string;
  estado?: boolean;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  carrera?: string;
  matricula?: string;
  activo: boolean;
  fechaRegistro: any;
}

const StatCard = ({
  title,
  value,
  iconName,
  onPress,
}: {
  title: string;
  value: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { width } = useWindowDimensions();
  const cardsPerRow =
    width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 2 : width < 1200 ? 3 : 4;
  const isFullWidth = cardsPerRow === 1;
  const cardWidth: DimensionValue = isFullWidth
    ? "100%"
    : `${100 / cardsPerRow - 3}%`;
  const padding = isMobile ? 18 : isTablet ? 20 : 22;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          padding,
          minHeight: isMobile ? 132 : 150,
          marginRight: isFullWidth ? 0 : 12,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeaderRow}>
        <View style={[styles.cardIconWrapper, { padding: isMobile ? 12 : 14 }]}>
          <Ionicons name={iconName} size={isMobile ? 26 : 28} color="#0A66FF" />
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardTitle, { fontSize: isMobile ? 13 : 14 }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.cardValue,
              { fontSize: isMobile ? 30 : isTablet ? 34 : 38 },
            ]}
          >
            {value}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooterRow}>
        <Text style={[styles.cardHint, { fontSize: isMobile ? 12 : 13 }]}>
          Ver detalle
        </Text>
        <View style={styles.cardTapIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#0A66FF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AdminDashboard = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [prestamosActivos, setPrestamosActivos] = useState<Prestamo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prestamosHoy, setPrestamosHoy] = useState<Prestamo[]>([]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalAnimation] = useState(new Animated.Value(0));

  // Modal para escaneo QR (RF-6)
  const [showQrModal, setShowQrModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedPrestamo, setScannedPrestamo] = useState<Prestamo | null>(null);
  const router = useRouter();

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hacer todas las peticiones en paralelo
    Promise.all([
      fetch("http://217.182.64.251:8002/prestamos").then((res) => res.json()),
      fetch("http://217.182.64.251:8002/usuarios").then((res) => res.json()),
      fetch("http://217.182.64.251:8002/articulos").then((res) => res.json()),
    ])
      .then(([prestamosData, usuariosData, articulosData]) => {
        console.log("Préstamos recibidos:", prestamosData);
        console.log("Usuarios recibidos:", usuariosData);
        console.log("Artículos recibidos:", articulosData);

        // Crear mapas para búsqueda rápida
        const usuariosMap = new Map();
        const articulosMap = new Map();

        // Mapear usuarios
        if (Array.isArray(usuariosData)) {
          usuariosData.forEach((u: any) => {
            usuariosMap.set(u.ID, {
              id: u.ID?.toString() || "",
              nombre: u.Nombre || `Usuario #${u.ID}`,
              email: u.Email || "",
              telefono: u.Telefono || "",
              carrera: u.Carrera || "",
              matricula: u.Matricula || "",
              activo: u.Activo !== false,
              fechaRegistro: u["Fecha Registro"] || null,
            });
          });

          setUsuarios(Array.from(usuariosMap.values()));
        }

        // Mapear artículos/equipos
        if (Array.isArray(articulosData)) {
          articulosData.forEach((a: any) => {
            articulosMap.set(a.ID, {
              id: a.ID?.toString() || "",
              nombre: a.Nombre || `Artículo #${a.ID}`,
              categoria: a.Categoria || "",
              tipo: a.Tipo || "",
              estado: a.Disponible !== false,
            });
          });

          setEquipos(Array.from(articulosMap.values()));
        }

        // Mapear préstamos con nombres reales
        if (Array.isArray(prestamosData)) {
          const prestamosMapeados = prestamosData.map((p: any) => {
            const usuario = usuariosMap.get(p["ID Usuario"]);
            const articulo = articulosMap.get(p["ID Articulo"]);

            return {
              id: p.ID?.toString() || "",
              equipoNombre:
                articulo?.nombre || `Equipo #${p["ID Articulo"] || "?"}`,
              usuarioNombre:
                usuario?.nombre || `Usuario #${p["ID Usuario"] || "?"}`,
              estado: (p.Estado || "").toLowerCase(),
              fechaSolicitud: p["Fecha Solicitud"] || null,
              fechaAprobacion: p["Fecha Inicio"] || null,
              fechaDevolucionEsperada: p["Fecha Fin"] || null,
              proposito: p.Proposito || p.Nota || "",
            };
          });

          console.log("Préstamos mapeados:", prestamosMapeados);

          // Filtrar préstamos activos (aprobados/pendientes)
          const activos = prestamosMapeados.filter(
            (p: any) =>
              p.estado === "aceptado" ||
              p.estado === "aprobado" ||
              p.estado === "pendiente",
          );

          setPrestamosActivos(activos);
          setPrestamosHoy(prestamosMapeados);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const openModal = (modalKey: string) => {
    setActiveModal(modalKey);
    setFiltroTexto("");
    setFiltroEstado("todos");
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setActiveModal(null));
  };

  // Acciones RF-5 (aprobación/rechazo)
  const actualizarEstadoPrestamo = (
    id: string,
    estado: "aprobado" | "rechazado",
  ) => {

    try {
      fetch(`http://217.182.64.251:8002/prestamos/uriel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: estado, fecha_aprobacion: new Date().toISOString().split('T')[0] }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error('Error al actualizar el estado del préstamo');
        }
      }
      )
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el estado del préstamo. Por favor, inténtalo de nuevo.",
      );
      console.error("Error al actualizar el estado del préstamo:", error);
    }

    setPrestamosHoy((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado } : p,
      ),
    );
    setPrestamosActivos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado } : p,
      ),
    );
  };

  const aprobarPrestamo = (prestamoId: string) => {
    
    actualizarEstadoPrestamo(prestamoId, "aprobado");
  };

  const rechazarPrestamo = (prestamoId: string) => {
    Alert.alert(
      "Demo",
      "En la versión completa, esto rechazaría la solicitud y notificaría al usuario.",
    );
    actualizarEstadoPrestamo(prestamoId, "rechazado");
  };

  const marcarComoDevuelto = async (prestamoId: string) => {
    Alert.alert(
      "Demo",
      "En la versión completa, esto marcaría el préstamo como devuelto",
    );
    setPrestamosActivos((prev) => prev.filter((p) => p.id !== prestamoId));
  };

  const toggleUsuarioStatus = async (
    usuarioId: string,
    currentStatus: boolean,
  ) => {
    Alert.alert(
      "Demo",
      `En la versión completa, esto ${!currentStatus ? "activaría" : "desactivaría"} el usuario`,
    );
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId ? { ...u, activo: !currentStatus } : u,
      ),
    );
  };

  const formatEstadoLabel = (estado: string) =>
    estado.charAt(0).toUpperCase() + estado.slice(1);

  const getStatusTokens = (estado: string) => {
    const palette: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      pendiente: {
        bg: "rgba(255, 193, 7, 0.16)",
        text: "#8a6500",
        border: "rgba(255, 193, 7, 0.28)",
      },
      aprobado: {
        bg: "rgba(40, 167, 69, 0.14)",
        text: "#1f7a39",
        border: "rgba(40, 167, 69, 0.32)",
      },
      rechazado: {
        bg: "rgba(220, 53, 69, 0.14)",
        text: "#932937",
        border: "rgba(220, 53, 69, 0.28)",
      },
      devuelto: {
        bg: "rgba(108, 117, 125, 0.14)",
        text: "#505960",
        border: "rgba(108, 117, 125, 0.26)",
      },
      disponible: {
        bg: "rgba(40, 167, 69, 0.14)",
        text: "#1f7a39",
        border: "rgba(40, 167, 69, 0.32)",
      },
      "no-disponible": {
        bg: "rgba(220, 53, 69, 0.14)",
        text: "#932937",
        border: "rgba(220, 53, 69, 0.28)",
      },
      activo: {
        bg: "rgba(40, 167, 69, 0.14)",
        text: "#1f7a39",
        border: "rgba(40, 167, 69, 0.32)",
      },
      inactivo: {
        bg: "rgba(220, 53, 69, 0.14)",
        text: "#932937",
        border: "rgba(220, 53, 69, 0.28)",
      },
    };

    return (
      palette[estado.toLowerCase()] || {
        bg: "rgba(0, 123, 255, 0.12)",
        text: "#0A4FA3",
        border: "rgba(0, 123, 255, 0.24)",
      }
    );
  };

  const renderPrestamoItem = ({ item }: { item: Prestamo }) => {
    const badge = getStatusTokens(item.estado);

    return (
      <View style={styles.listCard}>
        <View style={styles.listItemHeader}>
          <View style={styles.listTitleBlock}>
            <Text style={styles.listItemTitle}>{item.equipoNombre}</Text>
            <Text style={styles.listItemSubtitle}>{item.usuarioNombre}</Text>
          </View>
          <View
            style={[
              styles.pill,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <Text style={[styles.pillText, { color: badge.text }]}>
              {formatEstadoLabel(item.estado)}
            </Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#4b5563"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>
              {item.fechaAprobacion
                ? item.fechaAprobacion instanceof Date
                  ? item.fechaAprobacion.toLocaleDateString("es-ES")
                  : "Sin fecha"
                : "Sin fecha"}
            </Text>
          </View>
          {item.proposito ? (
            <View style={[styles.metaChip, styles.metaChipGhost]}>
              <Ionicons
                name="bookmark-outline"
                size={14}
                color="#4b5563"
                style={styles.metaIcon}
              />
              <Text
                style={styles.metaText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.proposito}
              </Text>
            </View>
          ) : null}
        </View>

        {item.estado === "pendiente" && (
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSuccess]}
              onPress={() => aprobarPrestamo(item.id)}
              activeOpacity={0.9}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => rechazarPrestamo(item.id)}
              activeOpacity={0.9}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.estado === "aprobado" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => marcarComoDevuelto(item.id)}
            activeOpacity={0.85}
          >
            <Ionicons name="return-up-back" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Marcar como devuelto</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEquipoItem = ({ item }: { item: Equipo }) => {
    const badge = getStatusTokens(item.estado ? "disponible" : "no-disponible");

    return (
      <View style={styles.listCard}>
        <View style={styles.listItemHeader}>
          <View style={styles.listTitleBlock}>
            <Text style={styles.listItemTitle}>{item.nombre}</Text>
            {item.categoria && (
              <Text style={styles.listItemSubtitle}>
                Categoría: {item.categoria}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.pill,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <Text style={[styles.pillText, { color: badge.text }]}>
              {item.estado ? "Disponible" : "No disponible"}
            </Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          {item.tipo ? (
            <View style={styles.metaChip}>
              <Ionicons
                name="hardware-chip-outline"
                size={14}
                color="#4b5563"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>Tipo: {item.tipo}</Text>
            </View>
          ) : null}
          <View style={[styles.metaChip, styles.metaChipGhost]}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color="#4b5563"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>ID interno: {item.id}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUsuarioItem = ({ item }: { item: Usuario }) => {
    const badge = getStatusTokens(item.activo ? "activo" : "inactivo");

    return (
      <View style={styles.listCard}>
        <View style={styles.listItemHeader}>
          <View style={styles.listTitleBlock}>
            <Text style={styles.listItemTitle}>{item.nombre}</Text>
            <Text style={styles.listItemSubtitle}>{item.email}</Text>
            {item.matricula && (
              <Text style={styles.listItemSubtitle}>
                Matrícula: {item.matricula}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.pill,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <Text style={[styles.pillText, { color: badge.text }]}>
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="calendar-number-outline"
              size={14}
              color="#4b5563"
              style={styles.metaIcon}
            />
            <Text style={styles.metaText}>
              {item.fechaRegistro instanceof Date
                ? item.fechaRegistro.toLocaleDateString("es-ES")
                : "Registro no disponible"}
            </Text>
          </View>
          {item.telefono ? (
            <View style={[styles.metaChip, styles.metaChipGhost]}>
              <Ionicons
                name="call-outline"
                size={14}
                color="#4b5563"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{item.telefono}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.activo ? "#C12C48" : "#1E7A39" },
          ]}
          onPress={() => toggleUsuarioStatus(item.id, item.activo)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonText}>
            {item.activo ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const filtrarDatos = (datos: any[], tipo: string) => {
    // Ensure datos is an array
    if (!datos || !Array.isArray(datos)) {
      return [];
    }

    let datosFiltrados = datos;
    const normalize = (text?: string) =>
      (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    if (filtroTexto) {
      const q = normalize(filtroTexto);
      switch (tipo) {
        case "prestamos":
          datosFiltrados = datos.filter(
            (item) =>
              normalize(item.equipoNombre).includes(q) ||
              normalize(item.usuarioNombre).includes(q),
          );
          break;
        case "equipos":
          datosFiltrados = datos.filter(
            (item) =>
              normalize(item.nombre).includes(q) ||
              normalize(item.categoria).includes(q) ||
              normalize(item.tipo).includes(q),
          );
          break;
        case "usuarios":
          datosFiltrados = datos.filter(
            (item) =>
              normalize(item.nombre).includes(q) ||
              normalize(item.email).includes(q) ||
              normalize(item.matricula).includes(q),
          );
          break;
      }
    }

    if (filtroEstado !== "todos") {
      switch (tipo) {
        case "prestamos":
          datosFiltrados = datosFiltrados.filter(
            (item) => item.estado === filtroEstado,
          );
          break;
        case "equipos":
          datosFiltrados = datosFiltrados.filter((item) =>
            filtroEstado === "disponible" ? item.estado : !item.estado,
          );
          break;
        case "usuarios":
          datosFiltrados = datosFiltrados.filter((item) =>
            filtroEstado === "activo" ? item.activo : !item.activo,
          );
          break;
      }
    }

    return datosFiltrados;
  };

  const renderModalContent = () => {
    if (!activeModal) return null;

    const modalProps = {
      transform: [
        {
          scale: modalAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
      opacity: modalAnimation,
    };

    let datos: any[] = [];
    let titulo = "";
    let filtrosEstado: { label: string; value: string }[] = [];
    let renderItem: any;

    switch (activeModal) {
      case "prestamos-activos":
        datos = filtrarDatos(prestamosActivos, "prestamos");
        titulo = "Préstamos Activos";
        filtrosEstado = [
          { label: "Todos", value: "todos" },
          { label: "Aprobados", value: "aprobado" },
          { label: "Pendientes", value: "pendiente" },
        ];
        renderItem = renderPrestamoItem;
        break;
      case "equipos":
        datos = filtrarDatos(equipos, "equipos");
        titulo = "Equipos";
        filtrosEstado = [
          { label: "Todos", value: "todos" },
          { label: "Disponibles", value: "disponible" },
          { label: "No Disponibles", value: "no-disponible" },
        ];
        renderItem = renderEquipoItem;
        break;
      case "usuarios":
        datos = filtrarDatos(usuarios, "usuarios");
        titulo = "Usuarios";
        filtrosEstado = [
          { label: "Todos", value: "todos" },
          { label: "Activos", value: "activo" },
          { label: "Inactivos", value: "inactivo" },
        ];
        renderItem = renderUsuarioItem;
        break;
      case "prestamos-hoy":
        datos = filtrarDatos(prestamosHoy, "prestamos");
        titulo = "Préstamos de Hoy";
        filtrosEstado = [
          { label: "Todos", value: "todos" },
          { label: "Aprobados", value: "aprobado" },
          { label: "Pendientes", value: "pendiente" },
          { label: "Rechazados", value: "rechazado" },
        ];
        renderItem = renderPrestamoItem;
        break;
    }

    return (
      <Animated.View style={[styles.modalContent, modalProps]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{titulo}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={filtroTexto}
              onChangeText={setFiltroTexto}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
              returnKeyType="search"
              inputMode="search"
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilters}
          >
            {filtrosEstado.map((filtro) => (
              <TouchableOpacity
                key={filtro.value}
                style={[
                  styles.statusFilterButton,
                  filtroEstado === filtro.value &&
                    styles.statusFilterButtonActive,
                ]}
                onPress={() => setFiltroEstado(filtro.value)}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    filtroEstado === filtro.value &&
                      styles.statusFilterTextActive,
                  ]}
                >
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {(datos?.length || 0).toString()} resultado
            {(datos?.length || 0) !== 1 ? "s" : ""}
          </Text>
        </View>

        <FlatList
          data={datos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.modalList}
          contentContainerStyle={styles.modalListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No se encontraron resultados</Text>
            </View>
          }
        />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  const containerPadding = isMobile ? 16 : isTablet ? 20 : 24;
  const titleSize = isMobile ? 22 : isTablet ? 26 : 32;

  // CALCULAR DATOS DINÁMICOS DESDE EL BACKEND

  // Préstamos por mes (últimos 6 meses)
  const lineChartData = React.useMemo(() => {
    if (!Array.isArray(prestamosHoy) || prestamosHoy.length === 0)
      return [0, 0, 0, 0, 0, 0];

    const now = new Date();
    const monthCounts = [0, 0, 0, 0, 0, 0];

    prestamosHoy.forEach((prestamo) => {
      const fechaSolicitud = prestamo.fechaSolicitud
        ? new Date(prestamo.fechaSolicitud)
        : null;
      if (fechaSolicitud && !isNaN(fechaSolicitud.getTime())) {
        const monthsAgo =
          (now.getFullYear() - fechaSolicitud.getFullYear()) * 12 +
          (now.getMonth() - fechaSolicitud.getMonth());
        if (monthsAgo >= 0 && monthsAgo < 6) {
          monthCounts[5 - monthsAgo]++;
        }
      }
    });

    return monthCounts;
  }, [prestamosHoy]);

  const lineChartLabels = React.useMemo(() => {
    const now = new Date();
    const labels = [];
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(meses[date.getMonth()]);
    }

    return labels;
  }, []);

  // Equipos por categoría
  const barChartData = React.useMemo(() => {
    if (!Array.isArray(equipos) || equipos.length === 0) return [];

    const categorias: { [key: string]: number } = {};
    equipos.forEach((equipo) => {
      const categoria = equipo.categoria || equipo.tipo || "Otros";
      categorias[categoria] = (categorias[categoria] || 0) + 1;
    });

    const colores = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#06b6d4",
      "#f43f5e",
    ];

    return Object.entries(categorias)
      .map(([label, value], index) => ({
        label,
        value,
        color: colores[index % colores.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [equipos]);

  // Estados de préstamos
  const pieChartData = React.useMemo(() => {
    if (!Array.isArray(prestamosHoy) || prestamosHoy.length === 0) {
      return [{ name: "Sin datos", value: 1, color: "#e5e7eb" }];
    }

    const estados: { [key: string]: number } = {};
    prestamosHoy.forEach((prestamo) => {
      const estado = prestamo.estado || "desconocido";
      estados[estado] = (estados[estado] || 0) + 1;
    });

    const estadoMap: { [key: string]: { name: string; color: string } } = {
      aceptado: { name: "Activos", color: "#10b981" },
      aprobado: { name: "Activos", color: "#10b981" },
      pendiente: { name: "Pendientes", color: "#fbbf24" },
      devuelto: { name: "Devueltos", color: "#6b7280" },
      rechazado: { name: "Rechazados", color: "#ef4444" },
      vencido: { name: "Vencidos", color: "#dc2626" },
    };

    const consolidado: { [key: string]: { value: number; color: string } } = {};
    Object.entries(estados).forEach(([estado, count]) => {
      const mapped = estadoMap[estado] || {
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        color: "#9ca3af",
      };
      if (consolidado[mapped.name]) {
        consolidado[mapped.name].value += count;
      } else {
        consolidado[mapped.name] = { value: count, color: mapped.color };
      }
    });

    return Object.entries(consolidado).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color,
    }));
  }, [prestamosHoy]);

  // Métricas de progreso
  const progressData = React.useMemo(() => {
    const totalEquipos = equipos.length || 1;
    const equiposDisponibles = equipos.filter((e) => e.estado).length;
    const disponibilidad = equiposDisponibles / totalEquipos;

    const utilizacion = prestamosActivos.length / totalEquipos;

    // Calcular satisfacción basado en préstamos completados vs rechazados
    const completados =
      prestamosHoy.filter(
        (p) =>
          p.estado === "devuelto" ||
          p.estado === "aprobado" ||
          p.estado === "aceptado",
      ).length || 1;
    const rechazados = prestamosHoy.filter(
      (p) => p.estado === "rechazado",
    ).length;
    const satisfaccion = completados / (completados + rechazados);

    return [
      {
        label: "Disponibilidad",
        value: Math.min(disponibilidad, 1),
        color: "#3b82f6",
      },
      {
        label: "Utilización",
        value: Math.min(utilizacion, 1),
        color: "#8b5cf6",
      },
      {
        label: "Satisfacción",
        value: Math.min(satisfaccion, 1),
        color: "#10b981",
      },
    ];
  }, [equipos, prestamosActivos, prestamosHoy]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: containerPadding,
          paddingTop:
            isMobile || isTablet ? containerPadding + 8 : containerPadding,
        }}
      >
        <View style={{ width: "100%", maxWidth: isDesktop ? 1400 : "100%" }}>
          {/* Header con título y botón de reporte (RF-8) */}
          <View
            style={[
              styles.dashboardHeader,
              { marginBottom: isMobile ? 16 : 24 },
            ]}
          >
            <Text
              style={[styles.title, { fontSize: titleSize, marginBottom: 0 }]}
            >
              Dashboard de Administrador
            </Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                Alert.alert(
                  "Descargar Reporte",
                  "¿En qué formato deseas descargar el reporte?",
                  [
                    {
                      text: "PDF",
                      onPress: () =>
                        Alert.alert(
                          "Descargando...",
                          "Reporte en formato PDF generado correctamente",
                        ),
                    },
                    {
                      text: "CSV",
                      onPress: () =>
                        Alert.alert(
                          "Descargando...",
                          "Reporte en formato CSV generado correctamente",
                        ),
                    },
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                  ],
                );
              }}
            >
              <Ionicons
                name="download-outline"
                size={isMobile ? 18 : 20}
                color="#fff"
              />
              <Text
                style={[
                  styles.downloadButtonText,
                  { fontSize: isMobile ? 12 : 14 },
                ]}
              >
                {isMobile ? "Reporte" : "Descargar Reporte (PDF/CSV)"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardsContainer}>
            <StatCard
              title="Préstamos Activos"
              value={
                Array.isArray(prestamosActivos)
                  ? prestamosActivos.length.toString()
                  : "0"
              }
              iconName="stats-chart"
              onPress={() => openModal("prestamos-activos")}
            />
            <StatCard
              title="Equipos Disponibles"
              value={
                Array.isArray(equipos)
                  ? equipos.filter((e) => e.estado).length.toString()
                  : "0"
              }
              iconName="checkbox-outline"
              onPress={() => openModal("equipos")}
            />
            <StatCard
              title="Total de Usuarios"
              value={Array.isArray(usuarios) ? usuarios.length.toString() : "0"}
              iconName="people"
              onPress={() => openModal("usuarios")}
            />
            <StatCard
              title="Préstamos Hoy"
              value={
                Array.isArray(prestamosHoy)
                  ? prestamosHoy.length.toString()
                  : "0"
              }
              iconName="calendar-outline"
              onPress={() => openModal("prestamos-hoy")}
            />
          </View>

          {/* Sección de Gráficas */}
          <View style={styles.chartsSection}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="bar-chart"
                size={isMobile ? 20 : 24}
                color={Colors.light.primary}
              />
              <Text
                style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 22 }]}
              >
                Análisis y Reportes
              </Text>
            </View>

            {/* Gráfica de Línea - Préstamos por Mes */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="trending-up" size={24} color="#0A66FF" />
                <Text style={styles.chartTitle}>Préstamos Mensuales</Text>
              </View>
              <Text style={styles.chartDescription}>
                Evolución de préstamos durante los últimos 6 meses
              </Text>
              <View style={styles.lineChartContainer}>
                <View style={styles.lineChartGrid}>
                  {lineChartData.map((value, index) => {
                    const maxValue = Math.max(...lineChartData);
                    const heightPercent = (value / maxValue) * 100;
                    return (
                      <View key={index} style={styles.lineChartColumn}>
                        <View style={styles.lineChartBarWrapper}>
                          <View
                            style={[
                              styles.lineChartBar,
                              { height: `${heightPercent}%` as any },
                            ]}
                          />
                          <Text style={styles.lineChartValue}>{value}</Text>
                        </View>
                        <Text style={styles.lineChartLabel}>
                          {lineChartLabels[index]}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Gráfica de Barras - Equipos por Categoría */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="bar-chart" size={24} color="#0A66FF" />
                <Text style={styles.chartTitle}>Equipos por Categoría</Text>
              </View>
              <Text style={styles.chartDescription}>
                Distribución del inventario por tipo de equipo
              </Text>
              <View style={styles.barChartContainer}>
                {barChartData.map((item, index) => {
                  const maxValue = Math.max(
                    ...barChartData.map((d) => d.value),
                  );
                  const widthPercent = (item.value / maxValue) * 100;
                  return (
                    <View key={index} style={styles.barChartRow}>
                      <Text style={styles.barChartLabel}>{item.label}</Text>
                      <View style={styles.barChartBarContainer}>
                        <View
                          style={[
                            styles.barChartBar,
                            {
                              width: `${widthPercent}%` as any,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                        <Text style={styles.barChartValue}>{item.value}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Grid de 2 columnas para gráficas más pequeñas */}
            <View
              style={[
                styles.chartsGrid,
                isMobile && { flexDirection: "column" },
              ]}
            >
              {/* Gráfica de Pie - Estados de Préstamos */}
              <View
                style={[styles.chartCard, !isMobile && styles.chartCardSmall]}
              >
                <View style={styles.chartHeader}>
                  <Ionicons name="pie-chart" size={20} color="#0A66FF" />
                  <Text
                    style={[
                      styles.chartTitle,
                      { fontSize: isMobile ? 15 : 16 },
                    ]}
                  >
                    Estados de Préstamos
                  </Text>
                </View>
                <View style={styles.pieChartContainer}>
                  {pieChartData.map((item, index) => {
                    const total = pieChartData.reduce(
                      (sum, d) => sum + d.value,
                      0,
                    );
                    const percentage = ((item.value / total) * 100).toFixed(0);
                    return (
                      <View key={index} style={styles.pieChartRow}>
                        <View
                          style={[
                            styles.pieChartColor,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text style={styles.pieChartLabel}>{item.name}</Text>
                        <Text style={styles.pieChartValue}>
                          {item.value} ({percentage}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Gráfica de Progreso - Métricas Clave */}
              <View
                style={[styles.chartCard, !isMobile && styles.chartCardSmall]}
              >
                <View style={styles.chartHeader}>
                  <Ionicons name="stats-chart" size={20} color="#0A66FF" />
                  <Text
                    style={[
                      styles.chartTitle,
                      { fontSize: isMobile ? 15 : 16 },
                    ]}
                  >
                    Métricas Clave
                  </Text>
                </View>
                <View style={styles.progressChartContainer}>
                  {progressData.map((item, index) => {
                    const percentage = item.value * 100;
                    return (
                      <View key={index} style={styles.progressChartRow}>
                        <Text style={styles.progressChartLabel}>
                          {item.label}
                        </Text>
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBarBackground}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${percentage}%` as any,
                                  backgroundColor: item.color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressBarValue}>
                            {percentage.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Tarjetas de Insights */}
            <View style={styles.insightsContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: isMobile ? 16 : 18, marginBottom: 12 },
                ]}
              >
                Insights Rápidos
              </Text>
              <View style={[styles.insightsGrid, isMobile && { gap: 10 }]}>
                <View style={styles.insightCard}>
                  <View
                    style={[styles.insightIcon, { backgroundColor: "#dcfce7" }]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={isMobile ? 20 : 24}
                      color="#16a34a"
                    />
                  </View>
                  <Text
                    style={[styles.insightValue, isMobile && { fontSize: 24 }]}
                  >
                    {((progressData[0]?.value || 0) * 100).toFixed(0)}%
                  </Text>
                  <Text
                    style={[styles.insightLabel, isMobile && { fontSize: 11 }]}
                  >
                    Tasa de Disponibilidad
                  </Text>
                </View>
                <View style={styles.insightCard}>
                  <View
                    style={[styles.insightIcon, { backgroundColor: "#dbeafe" }]}
                  >
                    <Ionicons
                      name="people"
                      size={isMobile ? 20 : 24}
                      color="#2563eb"
                    />
                  </View>
                  <Text
                    style={[styles.insightValue, isMobile && { fontSize: 24 }]}
                  >
                    {usuarios.filter((u) => u.activo).length}
                  </Text>
                  <Text
                    style={[styles.insightLabel, isMobile && { fontSize: 11 }]}
                  >
                    Usuarios Activos
                  </Text>
                </View>
                <View style={styles.insightCard}>
                  <View
                    style={[styles.insightIcon, { backgroundColor: "#fef3c7" }]}
                  >
                    <Ionicons
                      name="time"
                      size={isMobile ? 20 : 24}
                      color="#d97706"
                    />
                  </View>
                  <Text
                    style={[styles.insightValue, isMobile && { fontSize: 24 }]}
                  >
                    {(() => {
                      const prestamosConFechas = prestamosHoy.filter(
                        (p) => p.fechaSolicitud && p.fechaDevolucionEsperada,
                      );
                      if (prestamosConFechas.length === 0) return "0";
                      const promedio =
                        prestamosConFechas.reduce((sum, p) => {
                          const inicio = new Date(p.fechaSolicitud);
                          const fin = new Date(p.fechaDevolucionEsperada!);
                          const dias = Math.max(
                            0,
                            Math.ceil(
                              (fin.getTime() - inicio.getTime()) /
                                (1000 * 60 * 60 * 24),
                            ),
                          );
                          return sum + dias;
                        }, 0) / prestamosConFechas.length;
                      return promedio.toFixed(1);
                    })()}
                  </Text>
                  <Text
                    style={[styles.insightLabel, isMobile && { fontSize: 11 }]}
                  >
                    Días Promedio
                  </Text>
                </View>
                <View style={styles.insightCard}>
                  <View
                    style={[styles.insightIcon, { backgroundColor: "#e0e7ff" }]}
                  >
                    <Ionicons
                      name="trending-up"
                      size={isMobile ? 20 : 24}
                      color="#6366f1"
                    />
                  </View>
                  <Text
                    style={[styles.insightValue, isMobile && { fontSize: 24 }]}
                  >
                    {(() => {
                      if (lineChartData.length < 2) return "+0%";
                      const mesAnterior =
                        lineChartData[lineChartData.length - 2] || 1;
                      const mesActual =
                        lineChartData[lineChartData.length - 1] || 0;
                      const crecimiento =
                        mesAnterior === 0
                          ? 0
                          : ((mesActual - mesAnterior) / mesAnterior) * 100;
                      return `${crecimiento >= 0 ? "+" : ""}${crecimiento.toFixed(0)}%`;
                    })()}
                  </Text>
                  <Text
                    style={[styles.insightLabel, isMobile && { fontSize: 11 }]}
                  >
                    Crecimiento Mensual
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeModal}
            activeOpacity={1}
          />
          {renderModalContent()}
        </View>
      </Modal>

      {/* Botón flotante para Escanear QR (RF-6) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQrModal(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="qr-code-outline" size={24} color="#fff" />
        <Text style={styles.fabText}>Escanear QR</Text>
      </TouchableOpacity>

      {/* Modal de cámara QR */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowQrModal(false);
          setScannedData(null);
          setScannedPrestamo(null);
        }}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Ionicons name="qr-code" size={26} color="#0A2540" />
              <Text style={styles.qrModalTitle}>Escanear Código QR</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowQrModal(false);
                  setScannedData(null);
                  setScannedPrestamo(null);
                }}
              >
                <Ionicons name="close" size={26} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {!permission?.granted ? (
              <View style={styles.qrMockCamera}>
                <Ionicons name="camera-outline" size={64} color="#0A66FF" />
                <Text style={styles.qrMockText}>
                  Se necesita permiso para acceder a la cámara
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionButtonSuccess,
                    { marginTop: 16 },
                  ]}
                  onPress={requestPermission}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Permitir Cámara</Text>
                </TouchableOpacity>
              </View>
            ) : scannedPrestamo ? (
              <View style={styles.qrResultContainer}>
                <View style={styles.qrResultHeader}>
                  <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                  <Text style={styles.qrResultTitle}>QR Escaneado</Text>
                </View>

                <View style={styles.qrResultCard}>
                  <View style={styles.qrResultRow}>
                    <Text style={styles.qrResultLabel}>Equipo:</Text>
                    <Text style={styles.qrResultValue}>
                      {scannedPrestamo.equipoNombre}
                    </Text>
                  </View>
                  <View style={styles.qrResultRow}>
                    <Text style={styles.qrResultLabel}>Usuario:</Text>
                    <Text style={styles.qrResultValue}>
                      {scannedPrestamo.usuarioNombre}
                    </Text>
                  </View>
                  <View style={styles.qrResultRow}>
                    <Text style={styles.qrResultLabel}>Estado:</Text>
                    <View
                      style={[
                        styles.pill,
                        {
                          backgroundColor: getStatusTokens(
                            scannedPrestamo.estado,
                          ).bg,
                          borderColor: getStatusTokens(scannedPrestamo.estado)
                            .border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color: getStatusTokens(scannedPrestamo.estado).text,
                          },
                        ]}
                      >
                        {formatEstadoLabel(scannedPrestamo.estado)}
                      </Text>
                    </View>
                  </View>
                  {scannedPrestamo.proposito && (
                    <View style={styles.qrResultRow}>
                      <Text style={styles.qrResultLabel}>Propósito:</Text>
                      <Text style={styles.qrResultValue}>
                        {scannedPrestamo.proposito}
                      </Text>
                    </View>
                  )}
                </View>

                {scannedPrestamo.estado === "pendiente" && (
                  <View style={styles.qrActionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.actionButtonSuccess,
                        { flex: 1 },
                      ]}
                      onPress={() => {
                        aprobarPrestamo(scannedPrestamo.id);
                        setShowQrModal(false);
                        setScannedData(null);
                        setScannedPrestamo(null);
                      }}
                    >
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.actionButtonDanger,
                        { flex: 1 },
                      ]}
                      onPress={() => {
                        rechazarPrestamo(scannedPrestamo.id);
                        setShowQrModal(false);
                        setScannedData(null);
                        setScannedPrestamo(null);
                      }}
                    >
                      <Ionicons name="close" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#6b7280", marginTop: 12 },
                  ]}
                  onPress={() => {
                    setScannedData(null);
                    setScannedPrestamo(null);
                  }}
                >
                  <Ionicons name="scan" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Escanear Otro</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={(result) => {
                    if (scannedData) return; // Evitar múltiples escaneos

                    setScannedData(result.data);

                    // Buscar el préstamo por ID o QR
                    const prestamoId = result.data;
                    const prestamo = [
                      ...prestamosActivos,
                      ...prestamosHoy,
                    ].find(
                      (p) =>
                        p.id === prestamoId || p.id.toString() === prestamoId,
                    );

                    if (prestamo) {
                      setScannedPrestamo(prestamo);
                    } else {
                      Alert.alert(
                        "Préstamo no encontrado",
                        `No se encontró el préstamo con ID: ${prestamoId}`,
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              setScannedData(null);
                            },
                          },
                        ],
                      );
                    }
                  }}
                />
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerFrame} />
                  <Text style={styles.scannerText}>
                    Apunta al código QR del préstamo
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  title: {
    fontWeight: "bold",
    color: "#0A2540",
    marginBottom: 24,
    ...Platform.select({
      web: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
    }),
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a3a6b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.2s ease, transform 0.1s ease",
        ":hover": {
          backgroundColor: "#2a4a7b",
          transform: "translateY(-1px)",
        },
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
    ...Platform.select({
      web: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
    }),
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 24,
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6edf5",
    marginBottom: 16,
    alignItems: "stretch",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 14px 40px rgba(10,37,64,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ":hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 18px 48px rgba(10,37,64,0.12)",
        },
      },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
    position: "relative",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIconWrapper: {
    backgroundColor: "#e8f1ff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7e6ff",
  },
  cardIcon: { marginBottom: 0 },
  cardMeta: { flex: 1, marginLeft: 14 },
  cardTitle: {
    color: "#667788",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardValue: { color: "#0A2540", fontWeight: "800" },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  cardHint: { color: "#6b7280", letterSpacing: 0.2, fontWeight: "500" },
  cardTapIndicator: {
    backgroundColor: "#f0f5ff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#d7e6ff",
  },
  placeholder: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e6edf5",
    ...Platform.select({
      web: { boxShadow: "0 16px 38px rgba(10,37,64,0.08)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
  },
  placeholderText: {
    color: "#6b7280",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  chartsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A2540",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e6edf5",
    ...Platform.select({
      web: { boxShadow: "0 10px 30px rgba(10,37,64,0.08)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
      },
    }),
  },
  chartCardSmall: {
    flex: 1,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A2540",
  },
  chartDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  lineChartContainer: {
    marginTop: 10,
  },
  lineChartGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    paddingHorizontal: 10,
  },
  lineChartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  lineChartBarWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  lineChartBar: {
    width: "60%",
    backgroundColor: "#0A66FF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 20,
    ...Platform.select({
      web: {
        transition: "height 0.3s ease",
      },
    }),
  },
  lineChartValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A2540",
    marginTop: 4,
  },
  lineChartLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
    fontWeight: "600",
  },
  barChartContainer: {
    paddingVertical: 10,
  },
  barChartRow: {
    marginBottom: 16,
  },
  barChartLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  barChartBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barChartBar: {
    height: 28,
    borderRadius: 6,
    minWidth: 30,
    ...Platform.select({
      web: {
        transition: "width 0.3s ease",
      },
    }),
  },
  barChartValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A2540",
  },
  pieChartContainer: {
    paddingVertical: 10,
  },
  pieChartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pieChartColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  pieChartLabel: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    fontWeight: "600",
  },
  pieChartValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A2540",
  },
  progressChartContainer: {
    paddingVertical: 10,
  },
  progressChartRow: {
    marginBottom: 16,
  },
  progressChartLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 12,
    ...Platform.select({
      web: {
        transition: "width 0.3s ease",
      },
    }),
  },
  progressBarValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A2540",
    minWidth: 45,
    textAlign: "right",
  },
  chartsGrid: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  insightCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    flex: 1,
    minWidth: 140,
    maxWidth: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6edf5",
    ...Platform.select({
      web: { boxShadow: "0 8px 20px rgba(10,37,64,0.06)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  insightValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0A2540",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    backgroundColor: "#fdfefe",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e6edf5",
    width: "100%",
    maxWidth: 720,
    maxHeight: "85%",
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e6edf5",
    backgroundColor: "#f7f9fc",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0A2540",
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#eef2f7",
    borderWidth: 1,
    borderColor: "#e0e6ef",
  },
  filtersContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e6edf5",
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e4e9f2",
    ...Platform.select({
      web: { boxShadow: "0 10px 24px rgba(10,37,64,0.05)" },
    }),
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: "#1f2933" },
  statusFilters: { flexDirection: "row" },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e9f2",
    ...Platform.select({
      web: { transition: "all 0.15s ease", cursor: "pointer" },
    }),
  },
  statusFilterButtonActive: {
    backgroundColor: "#0A66FF",
    borderColor: "#0A66FF",
  },
  statusFilterText: { fontSize: 14, color: "#4b5563", fontWeight: "600" },
  statusFilterTextActive: { color: "#fff" },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f7f9fc",
    borderBottomWidth: 1,
    borderBottomColor: "#e6edf5",
  },
  resultsText: { fontSize: 14, color: "#4b5563", fontWeight: "600" },
  modalList: { flex: 1 },
  modalListContent: { paddingHorizontal: 14, paddingBottom: 24 },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6edf5",
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: "0 10px 24px rgba(10,37,64,0.06)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 5,
      },
    }),
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitleBlock: { flex: 1, paddingRight: 10 },
  listItemTitle: { fontSize: 16, fontWeight: "800", color: "#0A2540", flex: 1 },
  listItemSubtitle: { fontSize: 14, color: "#556273", marginTop: 2 },
  listMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f4f6fb",
    borderWidth: 1,
    borderColor: "#e4e9f2",
    marginRight: 8,
    marginTop: 6,
  },
  metaChipGhost: { backgroundColor: "#fff" },
  metaIcon: { marginRight: 6 },
  metaText: { fontSize: 13, color: "#4b5563", fontWeight: "500" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A66FF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: "0 16px 32px rgba(10,102,255,0.28)",
        cursor: "pointer",
      },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A66FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 12,
    ...Platform.select({
      web: { boxShadow: "0 10px 20px rgba(10,102,255,0.25)" },
    }),
  },
  actionButtonSuccess: { backgroundColor: "#1E7A39" },
  actionButtonDanger: { backgroundColor: "#C12C48" },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    gap: 16,
    ...Platform.select({
      web: { boxShadow: "0 20px 45px rgba(0,0,0,0.18)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  qrModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  qrModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#0A2540",
  },
  qrMockCamera: {
    height: 200,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#d7e6ff",
    backgroundColor: "#f3f6ff",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  qrMockText: {
    textAlign: "center",
    color: "#4b5563",
    lineHeight: 20,
  },
  qrPrimaryButton: {
    alignSelf: "stretch",
    justifyContent: "center",
    marginTop: 8,
  },
  cameraContainer: {
    height: 400,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scannerText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qrResultContainer: {
    padding: 16,
  },
  qrResultHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrResultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A2540",
    marginTop: 8,
  },
  qrResultCard: {
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  qrResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrResultLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  qrResultValue: {
    fontSize: 14,
    color: "#0A2540",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  qrActionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: "#888", marginTop: 10 },
});

export default AdminDashboard;
