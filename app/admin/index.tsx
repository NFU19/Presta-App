import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  DimensionValue,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface Prestamo {
  id: string;
  equipoNombre: string;
  usuarioNombre: string;
  estado: string;
  fechaSolicitud: any;
  fechaAprobacion?: any;
  fechaDevolucionEsperada?: any;
  proposito?: string;
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

const StatCard = ({ title, value, iconName, onPress }: { title: string; value: string; iconName: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) => {
  const { isMobile, isTablet } = useResponsive();
  const { width } = useWindowDimensions();
  const cardsPerRow = width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 2 : width < 1200 ? 3 : 4;
  const isFullWidth = cardsPerRow === 1;
  const cardWidth: DimensionValue = isFullWidth ? '100%' : `${100 / cardsPerRow - 3}%`;
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
          <Text style={[styles.cardTitle, { fontSize: isMobile ? 13 : 14 }]}>{title}</Text>
          <Text style={[styles.cardValue, { fontSize: isMobile ? 30 : isTablet ? 34 : 38 }]}>{value}</Text>
        </View>
      </View>
      <View style={styles.cardFooterRow}>
        <Text style={[styles.cardHint, { fontSize: isMobile ? 12 : 13 }]}>Ver detalle</Text>
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

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prestamosEjemplo: Prestamo[] = [
      {
        id: '1',
        equipoNombre: 'Laptop Dell XPS 13',
        usuarioNombre: 'Juan Pérez',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-20'),
        fechaAprobacion: new Date('2026-01-21'),
        fechaDevolucionEsperada: new Date('2026-01-28'),
        proposito: 'Proyecto final de carrera',
      },
      {
        id: '2',
        equipoNombre: 'Proyector Epson',
        usuarioNombre: 'María García',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-22'),
        fechaAprobacion: new Date('2026-01-22'),
        fechaDevolucionEsperada: new Date('2026-01-30'),
        proposito: 'Presentación de tesis',
      },
      {
        id: '3',
        equipoNombre: 'Cámara Canon EOS',
        usuarioNombre: 'Carlos López',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-23'),
        fechaAprobacion: new Date('2026-01-24'),
        fechaDevolucionEsperada: new Date('2026-02-01'),
        proposito: 'Documentación de experimentos',
      },
    ];

    for (let i = 4; i <= 12; i++) {
      prestamosEjemplo.push({
        id: i.toString(),
        equipoNombre: `Equipo ${i}`,
        usuarioNombre: `Usuario ${i}`,
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-24'),
        fechaAprobacion: new Date('2026-01-24'),
        fechaDevolucionEsperada: new Date('2026-02-02'),
        proposito: 'Actividades académicas',
      });
    }

    const equiposEjemplo: Equipo[] = [];
    for (let i = 1; i <= 69; i++) {
      equiposEjemplo.push({
        id: i.toString(),
        nombre: `Equipo ${i}`,
        categoria: i <= 20 ? 'Laptops' : i <= 40 ? 'Proyectores' : 'Otros',
        tipo: 'Electrónico',
        estado: i <= 58,
      });
    }

    const usuariosEjemplo: Usuario[] = [];
    for (let i = 1; i <= 134; i++) {
      usuariosEjemplo.push({
        id: i.toString(),
        nombre: `Usuario ${i}`,
        email: `usuario${i}@universidad.edu`,
        telefono: `555-010${i.toString().padStart(2, '0')}`,
        carrera: i <= 50 ? 'Ingeniería' : i <= 100 ? 'Ciencias' : 'Humanidades',
        matricula: `2024${i.toString().padStart(3, '0')}`,
        activo: i <= 130,
        fechaRegistro: new Date('2026-01-01'),
      });
    }

    const prestamosHoyEjemplo: Prestamo[] = [
      {
        id: 'h1',
        equipoNombre: 'Tablet iPad',
        usuarioNombre: 'Ana Martínez',
        estado: 'pendiente',
        fechaSolicitud: new Date(),
        proposito: 'Presentación en clase',
      },
      {
        id: 'h2',
        equipoNombre: 'Micrófono Shure',
        usuarioNombre: 'Pedro Rodríguez',
        estado: 'aprobado',
        fechaSolicitud: new Date(),
        fechaAprobacion: new Date(),
        proposito: 'Grabación de podcast',
      },
    ];

    for (let i = 3; i <= 8; i++) {
      prestamosHoyEjemplo.push({
        id: `h${i}`,
        equipoNombre: `Equipo del día ${i}`,
        usuarioNombre: `Estudiante ${i}`,
        estado: i <= 5 ? 'aprobado' : 'pendiente',
        fechaSolicitud: new Date(),
        fechaAprobacion: i <= 5 ? new Date() : undefined,
        proposito: 'Uso académico',
      });
    }

    setTimeout(() => {
      setPrestamosActivos(prestamosEjemplo);
      setEquipos(equiposEjemplo);
      setUsuarios(usuariosEjemplo);
      setPrestamosHoy(prestamosHoyEjemplo);
      setLoading(false);
    }, 1000);
  }, []);

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
    setFiltroTexto('');
    setFiltroEstado('todos');
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

  const marcarComoDevuelto = async (prestamoId: string) => {
    Alert.alert('Demo', 'En la versión completa, esto marcaría el préstamo como devuelto');
    setPrestamosActivos((prev) => prev.filter((p) => p.id !== prestamoId));
  };

  const toggleUsuarioStatus = async (usuarioId: string, currentStatus: boolean) => {
    Alert.alert('Demo', `En la versión completa, esto ${!currentStatus ? 'activaría' : 'desactivaría'} el usuario`);
    setUsuarios((prev) => prev.map((u) => (u.id === usuarioId ? { ...u, activo: !currentStatus } : u)));
  };

  const formatEstadoLabel = (estado: string) => estado.charAt(0).toUpperCase() + estado.slice(1);

  const getStatusTokens = (estado: string) => {
    const palette: Record<string, { bg: string; text: string; border: string }> = {
      pendiente: { bg: 'rgba(255, 193, 7, 0.16)', text: '#8a6500', border: 'rgba(255, 193, 7, 0.28)' },
      aprobado: { bg: 'rgba(40, 167, 69, 0.14)', text: '#1f7a39', border: 'rgba(40, 167, 69, 0.32)' },
      rechazado: { bg: 'rgba(220, 53, 69, 0.14)', text: '#932937', border: 'rgba(220, 53, 69, 0.28)' },
      devuelto: { bg: 'rgba(108, 117, 125, 0.14)', text: '#505960', border: 'rgba(108, 117, 125, 0.26)' },
      disponible: { bg: 'rgba(40, 167, 69, 0.14)', text: '#1f7a39', border: 'rgba(40, 167, 69, 0.32)' },
      'no-disponible': { bg: 'rgba(220, 53, 69, 0.14)', text: '#932937', border: 'rgba(220, 53, 69, 0.28)' },
      activo: { bg: 'rgba(40, 167, 69, 0.14)', text: '#1f7a39', border: 'rgba(40, 167, 69, 0.32)' },
      inactivo: { bg: 'rgba(220, 53, 69, 0.14)', text: '#932937', border: 'rgba(220, 53, 69, 0.28)' },
    };

    return (
      palette[estado.toLowerCase()] || {
        bg: 'rgba(0, 123, 255, 0.12)',
        text: '#0A4FA3',
        border: 'rgba(0, 123, 255, 0.24)',
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
          <View style={[styles.pill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.pillText, { color: badge.text }]}>{formatEstadoLabel(item.estado)}</Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color="#4b5563" style={styles.metaIcon} />
            <Text style={styles.metaText}>
              {item.fechaAprobacion
                ? item.fechaAprobacion instanceof Date
                  ? item.fechaAprobacion.toLocaleDateString('es-ES')
                  : 'Sin fecha'
                : 'Sin fecha'}
            </Text>
          </View>
          {item.proposito ? (
            <View style={[styles.metaChip, styles.metaChipGhost]}>
              <Ionicons name="bookmark-outline" size={14} color="#4b5563" style={styles.metaIcon} />
              <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                {item.proposito}
              </Text>
            </View>
          ) : null}
        </View>

        {item.estado === 'aprobado' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => marcarComoDevuelto(item.id)} activeOpacity={0.85}>
            <Ionicons name="return-up-back" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Marcar como devuelto</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEquipoItem = ({ item }: { item: Equipo }) => {
    const badge = getStatusTokens(item.estado ? 'disponible' : 'no-disponible');

    return (
      <View style={styles.listCard}>
        <View style={styles.listItemHeader}>
          <View style={styles.listTitleBlock}>
            <Text style={styles.listItemTitle}>{item.nombre}</Text>
            {item.categoria && <Text style={styles.listItemSubtitle}>Categoría: {item.categoria}</Text>}
          </View>
          <View style={[styles.pill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.pillText, { color: badge.text }]}>{item.estado ? 'Disponible' : 'No disponible'}</Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          {item.tipo ? (
            <View style={styles.metaChip}>
              <Ionicons name="hardware-chip-outline" size={14} color="#4b5563" style={styles.metaIcon} />
              <Text style={styles.metaText}>Tipo: {item.tipo}</Text>
            </View>
          ) : null}
          <View style={[styles.metaChip, styles.metaChipGhost]}>
            <Ionicons name="pricetag-outline" size={14} color="#4b5563" style={styles.metaIcon} />
            <Text style={styles.metaText}>ID interno: {item.id}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUsuarioItem = ({ item }: { item: Usuario }) => {
    const badge = getStatusTokens(item.activo ? 'activo' : 'inactivo');

    return (
      <View style={styles.listCard}>
        <View style={styles.listItemHeader}>
          <View style={styles.listTitleBlock}>
            <Text style={styles.listItemTitle}>{item.nombre}</Text>
            <Text style={styles.listItemSubtitle}>{item.email}</Text>
            {item.matricula && <Text style={styles.listItemSubtitle}>Matrícula: {item.matricula}</Text>}
          </View>
          <View style={[styles.pill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.pillText, { color: badge.text }]}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>

        <View style={styles.listMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-number-outline" size={14} color="#4b5563" style={styles.metaIcon} />
            <Text style={styles.metaText}>
              {item.fechaRegistro instanceof Date ? item.fechaRegistro.toLocaleDateString('es-ES') : 'Registro no disponible'}
            </Text>
          </View>
          {item.telefono ? (
            <View style={[styles.metaChip, styles.metaChipGhost]}>
              <Ionicons name="call-outline" size={14} color="#4b5563" style={styles.metaIcon} />
              <Text style={styles.metaText}>{item.telefono}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.activo ? '#C12C48' : '#1E7A39' }]}
          onPress={() => toggleUsuarioStatus(item.id, item.activo)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonText}>{item.activo ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const filtrarDatos = (datos: any[], tipo: string) => {
    let datosFiltrados = datos;

    if (filtroTexto) {
      switch (tipo) {
        case 'prestamos':
          datosFiltrados = datos.filter(
            (item) =>
              item.equipoNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
              item.usuarioNombre?.toLowerCase().includes(filtroTexto.toLowerCase()),
          );
          break;
        case 'equipos':
          datosFiltrados = datos.filter(
            (item) =>
              item.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
              item.categoria?.toLowerCase().includes(filtroTexto.toLowerCase()),
          );
          break;
        case 'usuarios':
          datosFiltrados = datos.filter(
            (item) =>
              item.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
              item.email?.toLowerCase().includes(filtroTexto.toLowerCase()),
          );
          break;
      }
    }

    if (filtroEstado !== 'todos') {
      switch (tipo) {
        case 'prestamos':
          datosFiltrados = datosFiltrados.filter((item) => item.estado === filtroEstado);
          break;
        case 'equipos':
          datosFiltrados = datosFiltrados.filter((item) => (filtroEstado === 'disponible' ? item.estado : !item.estado));
          break;
        case 'usuarios':
          datosFiltrados = datosFiltrados.filter((item) => (filtroEstado === 'activo' ? item.activo : !item.activo));
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
    let titulo = '';
    let filtrosEstado: { label: string; value: string }[] = [];
    let renderItem: any;

    switch (activeModal) {
      case 'prestamos-activos':
        datos = filtrarDatos(prestamosActivos, 'prestamos');
        titulo = 'Préstamos Activos';
        filtrosEstado = [
          { label: 'Todos', value: 'todos' },
          { label: 'Aprobados', value: 'aprobado' },
          { label: 'Pendientes', value: 'pendiente' },
        ];
        renderItem = renderPrestamoItem;
        break;
      case 'equipos':
        datos = filtrarDatos(equipos, 'equipos');
        titulo = 'Equipos';
        filtrosEstado = [
          { label: 'Todos', value: 'todos' },
          { label: 'Disponibles', value: 'disponible' },
          { label: 'No Disponibles', value: 'no-disponible' },
        ];
        renderItem = renderEquipoItem;
        break;
      case 'usuarios':
        datos = filtrarDatos(usuarios, 'usuarios');
        titulo = 'Usuarios';
        filtrosEstado = [
          { label: 'Todos', value: 'todos' },
          { label: 'Activos', value: 'activo' },
          { label: 'Inactivos', value: 'inactivo' },
        ];
        renderItem = renderUsuarioItem;
        break;
      case 'prestamos-hoy':
        datos = filtrarDatos(prestamosHoy, 'prestamos');
        titulo = 'Préstamos de Hoy';
        filtrosEstado = [
          { label: 'Todos', value: 'todos' },
          { label: 'Aprobados', value: 'aprobado' },
          { label: 'Pendientes', value: 'pendiente' },
          { label: 'Rechazados', value: 'rechazado' },
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
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {filtrosEstado.map((filtro) => (
              <TouchableOpacity
                key={filtro.value}
                style={[styles.statusFilterButton, filtroEstado === filtro.value && styles.statusFilterButtonActive]}
                onPress={() => setFiltroEstado(filtro.value)}
              >
                <Text style={[styles.statusFilterText, filtroEstado === filtro.value && styles.statusFilterTextActive]}>
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>{datos.length} resultado{datos.length !== 1 ? 's' : ''}</Text>
        </View>

        <FlatList
          data={datos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.modalList}
          contentContainerStyle={styles.modalListContent}
          showsVerticalScrollIndicator={false}
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: containerPadding,
        paddingTop: isMobile || isTablet ? containerPadding + 8 : containerPadding,
      }}
    >
      <View style={{ width: '100%', maxWidth: isDesktop ? 1400 : '100%' }}>
        <Text style={[styles.title, { fontSize: titleSize, marginBottom: isMobile ? 16 : 24 }]}>Dashboard de Administrador</Text>
        <View style={styles.cardsContainer}>
          <StatCard title="Préstamos Activos" value={prestamosActivos.length.toString()} iconName="stats-chart" onPress={() => openModal('prestamos-activos')} />
          <StatCard title="Equipos Disponibles" value={equipos.filter((e) => e.estado).length.toString()} iconName="checkbox-outline" onPress={() => openModal('equipos')} />
          <StatCard title="Total de Usuarios" value={usuarios.length.toString()} iconName="people" onPress={() => openModal('usuarios')} />
          <StatCard title="Préstamos Hoy" value={prestamosHoy.length.toString()} iconName="calendar-outline" onPress={() => openModal('prestamos-hoy')} />
        </View>
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { fontSize: isMobile ? 14 : 16 }]}>Más reportes y gráficos aparecerán aquí.</Text>
        </View>
      </View>

      <Modal visible={activeModal !== null} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeModal} activeOpacity={1} />
          {renderModalContent()}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  title: {
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 24,
    ...Platform.select({
      web: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' },
    }),
  },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 24, width: '100%' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    marginBottom: 16,
    alignItems: 'stretch',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 14px 40px rgba(10,37,64,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 18px 48px rgba(10,37,64,0.12)',
        },
      },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
    position: 'relative',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardIconWrapper: {
    backgroundColor: '#e8f1ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7e6ff',
  },
  cardIcon: { marginBottom: 0 },
  cardMeta: { flex: 1, marginLeft: 14 },
  cardTitle: {
    color: '#667788',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardValue: { color: '#0A2540', fontWeight: '800' },
  cardFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  cardHint: { color: '#6b7280', letterSpacing: 0.2, fontWeight: '500' },
  cardTapIndicator: {
    backgroundColor: '#f0f5ff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d7e6ff',
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    ...Platform.select({
      web: { boxShadow: '0 16px 38px rgba(10,37,64,0.08)' },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 6,
      },
    }),
  },
  placeholderText: { color: '#6b7280', textAlign: 'center', letterSpacing: 0.2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    backgroundColor: '#fdfefe',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6edf5',
    width: '100%',
    maxWidth: 720,
    maxHeight: '85%',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e6edf5',
    backgroundColor: '#f7f9fc',
  },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0A2540', letterSpacing: 0.3 },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eef2f7',
    borderWidth: 1,
    borderColor: '#e0e6ef',
  },
  filtersContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e6edf5', backgroundColor: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e4e9f2',
    ...Platform.select({
      web: { boxShadow: '0 10px 24px rgba(10,37,64,0.05)' },
    }),
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1f2933' },
  statusFilters: { flexDirection: 'row' },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e9f2',
    ...Platform.select({
      web: { transition: 'all 0.15s ease', cursor: 'pointer' },
    }),
  },
  statusFilterButtonActive: { backgroundColor: '#0A66FF', borderColor: '#0A66FF' },
  statusFilterText: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  statusFilterTextActive: { color: '#fff' },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f7f9fc',
    borderBottomWidth: 1,
    borderBottomColor: '#e6edf5',
  },
  resultsText: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  modalList: { flex: 1 },
  modalListContent: { paddingHorizontal: 14, paddingBottom: 24 },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6edf5',
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 10px 24px rgba(10,37,64,0.06)' },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 5,
      },
    }),
  },
  listItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  listTitleBlock: { flex: 1, paddingRight: 10 },
  listItemTitle: { fontSize: 16, fontWeight: '800', color: '#0A2540', flex: 1 },
  listItemSubtitle: { fontSize: 14, color: '#556273', marginTop: 2 },
  listMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f4f6fb',
    borderWidth: 1,
    borderColor: '#e4e9f2',
    marginRight: 8,
    marginTop: 6,
  },
  metaChipGhost: { backgroundColor: '#fff' },
  metaIcon: { marginRight: 6 },
  metaText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A66FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 12,
    ...Platform.select({
      web: { boxShadow: '0 10px 20px rgba(10,102,255,0.25)' },
    }),
  },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#888', marginTop: 10 },
});

export default AdminDashboard;
