import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

// Interfaces
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

const StatCard = ({
  title,
  value,
  icon,
  onPress,
}: {
  title: string;
  value: string;
  icon: string;
  onPress: () => void;
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { width } = useWindowDimensions();
  const cardsPerRow = width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 2 : width < 1200 ? 3 : 4;
  const isFullWidth = cardsPerRow === 1;
  const cardWidth = isFullWidth ? '100%' : `${100 / cardsPerRow - 3}%`;
  const padding = isMobile ? 20 : isTablet ? 22 : 24;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          padding,
          minHeight: isMobile ? 120 : 140,
          marginRight: isFullWidth ? 0 : 12,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.cardIcon, { fontSize: isMobile ? 32 : 36 }]}>{icon}</Text>
      <Text style={[styles.cardTitle, { fontSize: isMobile ? 13 : 14 }]}>{title}</Text>
      <Text style={[styles.cardValue, { fontSize: isMobile ? 28 : isTablet ? 32 : 36 }]}>{value}</Text>
      <View style={styles.cardTapIndicator}>
        <Ionicons name="chevron-forward" size={16} color="#007bff" />
      </View>
    </TouchableOpacity>
  );
};

const AdminDashboard = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Estados para los datos
  const [prestamosActivos, setPrestamosActivos] = useState<Prestamo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prestamosHoy, setPrestamosHoy] = useState<Prestamo[]>([]);
  
  // Estados para los modales
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalAnimation] = useState(new Animated.Value(0));
  
  // Estados para filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados de carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Datos de ejemplo para préstamos activos
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

    // Completar con más préstamos para llegar a 12
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

    // Datos de ejemplo para equipos
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

    // Datos de ejemplo para usuarios
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

    // Datos de ejemplo para préstamos de hoy
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

    // Completar con más préstamos para llegar a 8
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

    // Simular carga de datos
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
    }).start(() => {
      setActiveModal(null);
    });
  };

  const marcarComoDevuelto = async (prestamoId: string) => {
    Alert.alert('Demo', 'En la versión completa, esto marcaría el préstamo como devuelto');
    setPrestamosActivos((prev) => prev.filter((p) => p.id !== prestamoId));
  };

  const toggleUsuarioStatus = async (usuarioId: string, currentStatus: boolean) => {
    Alert.alert('Demo', `En la versión completa, esto ${!currentStatus ? 'activaría' : 'desactivaría'} el usuario`);
    setUsuarios((prev) => prev.map((u) => (u.id === usuarioId ? { ...u, activo: !currentStatus } : u)));
  };

  const renderPrestamoItem = ({ item }: { item: Prestamo }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.equipoNombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>{item.usuarioNombre}</Text>
      <Text style={styles.listItemDate}>
        {item.fechaAprobacion
          ? item.fechaAprobacion instanceof Date
            ? item.fechaAprobacion.toLocaleDateString('es-ES')
            : 'Sin fecha'
          : 'Sin fecha'}
      </Text>
      {item.estado === 'aprobado' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => marcarComoDevuelto(item.id)}>
          <Ionicons name="return-up-back" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Marcar como devuelto</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEquipoItem = ({ item }: { item: Equipo }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.nombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.estado ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.statusText}>{item.estado ? 'Disponible' : 'No Disponible'}</Text>
        </View>
      </View>
      {item.categoria && <Text style={styles.listItemSubtitle}>Categoría: {item.categoria}</Text>}
      {item.tipo && <Text style={styles.listItemSubtitle}>Tipo: {item.tipo}</Text>}
    </View>
  );

  const renderUsuarioItem = ({ item }: { item: Usuario }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.nombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.activo ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.statusText}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>{item.email}</Text>
      {item.matricula && <Text style={styles.listItemSubtitle}>Matrícula: {item.matricula}</Text>}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: item.activo ? '#dc3545' : '#28a745' }]}
        onPress={() => toggleUsuarioStatus(item.id, item.activo)}
      >
        <Text style={styles.actionButtonText}>{item.activo ? 'Desactivar' : 'Activar'}</Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#ffc107';
      case 'aprobado':
        return '#28a745';
      case 'rechazado':
        return '#dc3545';
      case 'devuelto':
        return '#6c757d';
      default:
        return '#007bff';
    }
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
    let filtrosEstado: Array<{ label: string; value: string }> = [];
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
        <ActivityIndicator size="large" color={Colors.primary} />
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
          <StatCard title="Préstamos Activos" value={prestamosActivos.length.toString()} icon="🔄" onPress={() => openModal('prestamos-activos')} />
          <StatCard title="Equipos Disponibles" value={equipos.filter((e) => e.estado).length.toString()} icon="✅" onPress={() => openModal('equipos')} />
          <StatCard title="Total de Usuarios" value={usuarios.length.toString()} icon="👥" onPress={() => openModal('usuarios')} />
          <StatCard title="Préstamos Hoy" value={prestamosHoy.length.toString()} icon="🗓️" onPress={() => openModal('prestamos-hoy')} />
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
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 24,
    ...Platform.select({
      web: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
    }),
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'default',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
    position: 'relative',
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#8899A8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardValue: {
    color: '#0A2540',
    fontWeight: 'bold',
  },
  cardTapIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  placeholderText: {
    color: '#8899A8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  filtersContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusFilterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalList: {
    flex: 1,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
    flex: 1,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listItemDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});

export default AdminDashboard;
<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
=======
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useResponsive } from '@/hooks/use-responsive';
>>>>>>> Stashed changes

// Interfaces
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

<<<<<<< Updated upstream
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
  icon, 
  onPress 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <View style={styles.cardTapIndicator}>
      <Ionicons name="chevron-forward" size={16} color="#007bff" />
    </View>
  </TouchableOpacity>
);

const AdminDashboard = () => {
  // Estados para los datos
  const [prestamosActivos, setPrestamosActivos] = useState<Prestamo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prestamosHoy, setPrestamosHoy] = useState<Prestamo[]>([]);
  
  // Estados para los modales
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalAnimation] = useState(new Animated.Value(0));
  
  // Estados para filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados de carga
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Datos de ejemplo para préstamos activos
    const prestamosEjemplo: Prestamo[] = [
      {
        id: '1',
        equipoNombre: 'Laptop Dell XPS 13',
        usuarioNombre: 'Juan Pérez',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-20'),
        fechaAprobacion: new Date('2026-01-21'),
        fechaDevolucionEsperada: new Date('2026-01-28'),
        proposito: 'Proyecto final de carrera'
      },
      {
        id: '2',
        equipoNombre: 'Proyector Epson',
        usuarioNombre: 'María García',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-22'),
        fechaAprobacion: new Date('2026-01-22'),
        fechaDevolucionEsperada: new Date('2026-01-30'),
        proposito: 'Presentación de tesis'
      },
      {
        id: '3',
        equipoNombre: 'Cámara Canon EOS',
        usuarioNombre: 'Carlos López',
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-23'),
        fechaAprobacion: new Date('2026-01-24'),
        fechaDevolucionEsperada: new Date('2026-02-01'),
        proposito: 'Documentación de experimentos'
      }
    ];

    // Completar con más préstamos para llegar a 12
    for (let i = 4; i <= 12; i++) {
      prestamosEjemplo.push({
        id: i.toString(),
        equipoNombre: `Equipo ${i}`,
        usuarioNombre: `Usuario ${i}`,
        estado: 'aprobado',
        fechaSolicitud: new Date('2026-01-24'),
        fechaAprobacion: new Date('2026-01-24'),
        fechaDevolucionEsperada: new Date('2026-02-02'),
        proposito: 'Actividades académicas'
      });
    }

    // Datos de ejemplo para equipos
    const equiposEjemplo: Equipo[] = [];
    for (let i = 1; i <= 69; i++) {
      equiposEjemplo.push({
        id: i.toString(),
        nombre: `Equipo ${i}`,
        categoria: i <= 20 ? 'Laptops' : i <= 40 ? 'Proyectores' : 'Otros',
        tipo: 'Electrónico',
        estado: i <= 58 // 58 disponibles, 11 no disponibles
      });
    }

    // Datos de ejemplo para usuarios
    const usuariosEjemplo: Usuario[] = [];
    for (let i = 1; i <= 134; i++) {
      usuariosEjemplo.push({
        id: i.toString(),
        nombre: `Usuario ${i}`,
        email: `usuario${i}@universidad.edu`,
        telefono: `555-010${i.toString().padStart(2, '0')}`,
        carrera: i <= 50 ? 'Ingeniería' : i <= 100 ? 'Ciencias' : 'Humanidades',
        matricula: `2024${i.toString().padStart(3, '0')}`,
        activo: i <= 130, // 130 activos, 4 inactivos
        fechaRegistro: new Date('2026-01-01')
      });
    }

    // Datos de ejemplo para préstamos de hoy
    const prestamosHoyEjemplo: Prestamo[] = [
      {
        id: 'h1',
        equipoNombre: 'Tablet iPad',
        usuarioNombre: 'Ana Martínez',
        estado: 'pendiente',
        fechaSolicitud: new Date(),
        proposito: 'Presentación en clase'
      },
      {
        id: 'h2',
        equipoNombre: 'Micrófono Shure',
        usuarioNombre: 'Pedro Rodríguez',
        estado: 'aprobado',
        fechaSolicitud: new Date(),
        fechaAprobacion: new Date(),
        proposito: 'Grabación de podcast'
      }
    ];

    // Completar con más préstamos para llegar a 8
    for (let i = 3; i <= 8; i++) {
      prestamosHoyEjemplo.push({
        id: `h${i}`,
        equipoNombre: `Equipo del día ${i}`,
        usuarioNombre: `Estudiante ${i}`,
        estado: i <= 5 ? 'aprobado' : 'pendiente',
        fechaSolicitud: new Date(),
        fechaAprobacion: i <= 5 ? new Date() : undefined,
        proposito: 'Uso académico'
      });
    }

    // Simular carga de datos
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
    }).start(() => {
      setActiveModal(null);
    });
  };

  const marcarComoDevuelto = async (prestamoId: string) => {
    // Simular actualización
    Alert.alert('Demo', 'En la versión completa, esto marcaría el préstamo como devuelto');
    
    // Actualizar el estado local para demostración
    setPrestamosActivos(prev => prev.filter(p => p.id !== prestamoId));
  };

  const toggleUsuarioStatus = async (usuarioId: string, currentStatus: boolean) => {
    // Simular actualización
    Alert.alert('Demo', `En la versión completa, esto ${!currentStatus ? 'activaría' : 'desactivaría'} el usuario`);
    
    // Actualizar el estado local para demostración
    setUsuarios(prev => prev.map(u => 
      u.id === usuarioId ? { ...u, activo: !currentStatus } : u
    ));
  };

  // Renderizadores de items
  const renderPrestamoItem = ({ item }: { item: Prestamo }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.equipoNombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>{item.usuarioNombre}</Text>
      <Text style={styles.listItemDate}>
        {item.fechaAprobacion ? 
          (item.fechaAprobacion instanceof Date ? 
            item.fechaAprobacion.toLocaleDateString('es-ES') : 
            'Sin fecha'
          ) : 
          'Sin fecha'
        }
      </Text>
      {item.estado === 'aprobado' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => marcarComoDevuelto(item.id)}
        >
          <Ionicons name="return-up-back" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Marcar como devuelto</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEquipoItem = ({ item }: { item: Equipo }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.nombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.estado ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.statusText}>{item.estado ? 'Disponible' : 'No Disponible'}</Text>
        </View>
      </View>
      {item.categoria && <Text style={styles.listItemSubtitle}>Categoría: {item.categoria}</Text>}
      {item.tipo && <Text style={styles.listItemSubtitle}>Tipo: {item.tipo}</Text>}
    </View>
  );

  const renderUsuarioItem = ({ item }: { item: Usuario }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.nombre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.activo ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.statusText}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>
      <Text style={styles.listItemSubtitle}>{item.email}</Text>
      {item.matricula && <Text style={styles.listItemSubtitle}>Matrícula: {item.matricula}</Text>}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: item.activo ? '#dc3545' : '#28a745' }]}
        onPress={() => toggleUsuarioStatus(item.id, item.activo)}
      >
        <Text style={styles.actionButtonText}>
          {item.activo ? 'Desactivar' : 'Activar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return '#ffc107';
      case 'aprobado': return '#28a745';
      case 'rechazado': return '#dc3545';
      case 'devuelto': return '#6c757d';
      default: return '#007bff';
    }
  };

  // Funciones de filtrado
  const filtrarDatos = (datos: any[], tipo: string) => {
    let datosFiltrados = datos;

    if (filtroTexto) {
      switch (tipo) {
        case 'prestamos':
          datosFiltrados = datos.filter(item => 
            item.equipoNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            item.usuarioNombre?.toLowerCase().includes(filtroTexto.toLowerCase())
          );
          break;
        case 'equipos':
          datosFiltrados = datos.filter(item => 
            item.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            item.categoria?.toLowerCase().includes(filtroTexto.toLowerCase())
          );
          break;
        case 'usuarios':
          datosFiltrados = datos.filter(item => 
            item.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            item.email?.toLowerCase().includes(filtroTexto.toLowerCase())
          );
          break;
      }
    }

    if (filtroEstado !== 'todos') {
      switch (tipo) {
        case 'prestamos':
          datosFiltrados = datosFiltrados.filter(item => item.estado === filtroEstado);
          break;
        case 'equipos':
          datosFiltrados = datosFiltrados.filter(item => 
            filtroEstado === 'disponible' ? item.estado : !item.estado
          );
          break;
        case 'usuarios':
          datosFiltrados = datosFiltrados.filter(item => 
            filtroEstado === 'activo' ? item.activo : !item.activo
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
    let titulo = '';
    let filtrosEstado: Array<{label: string, value: string}> = [];
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
                style={[
                  styles.statusFilterButton,
                  filtroEstado === filtro.value && styles.statusFilterButtonActive
                ]}
                onPress={() => setFiltroEstado(filtro.value)}
              >
                <Text style={[
                  styles.statusFilterText,
                  filtroEstado === filtro.value && styles.statusFilterTextActive
                ]}>
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {datos.length} resultado{datos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={datos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.modalList}
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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard de Administrador</Text>
      <View style={styles.cardsContainer}>
        <StatCard 
          title="Préstamos Activos" 
          value={prestamosActivos.length.toString()} 
          icon="🔄"
          onPress={() => openModal('prestamos-activos')}
        />
        <StatCard 
          title="Equipos Disponibles" 
          value={equipos.filter(e => e.estado).length.toString()} 
          icon="✅"
          onPress={() => openModal('equipos')}
        />
        <StatCard 
          title="Total de Usuarios" 
          value={usuarios.length.toString()} 
          icon="👥"
          onPress={() => openModal('usuarios')}
        />
        <StatCard 
          title="Préstamos Hoy" 
          value={prestamosHoy.length.toString()} 
          icon="🗓️"
          onPress={() => openModal('prestamos-hoy')}
        />
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Más reportes y gráficos aparecerán aquí.</Text>
=======
const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => {
  const { isMobile, isTablet } = useResponsive();
  const { width } = useWindowDimensions();
  const cardsPerRow = width < 576 ? 1 : width < 768 ? 2 : width < 992 ? 2 : width < 1200 ? 3 : 4;
  const isFullWidth = cardsPerRow === 1;
  const cardWidth = isFullWidth ? '100%' : `${(100 / cardsPerRow) - 3}%`;

  return (
    <View style={[
      styles.card,
      { 
        width: cardWidth,
        padding: isMobile ? 20 : isTablet ? 22 : 24,
        minHeight: isMobile ? 120 : 140,
      }
    ]}>
      <Text style={[styles.cardIcon, { fontSize: isMobile ? 32 : 36 }]}>{icon}</Text>
      <Text style={[styles.cardTitle, { fontSize: isMobile ? 13 : 14 }]}>{title}</Text>
      <Text style={[styles.cardValue, { fontSize: isMobile ? 28 : isTablet ? 32 : 36 }]}>{value}</Text>
    </View>
  );
};

const AdminDashboard = () => {
  const { width } = useWindowDimensions();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Responsive values
  const containerPadding = isMobile ? 16 : isTablet ? 20 : 24;
  const titleSize = isMobile ? 22 : isTablet ? 26 : 32;
  const cardGap = isMobile ? 12 : 16;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{
        padding: containerPadding,
        paddingTop: isMobile || isTablet ? containerPadding + 8 : containerPadding,
      }}>
      <View style={{ width: '100%', maxWidth: isDesktop ? 1400 : '100%' }}>
        <Text style={[styles.title, { fontSize: titleSize, marginBottom: isMobile ? 16 : 24 }]}>
          Dashboard de Administrador
        </Text>
        <View style={[styles.cardsContainer, { gap: cardGap }]}>
          <StatCard title="Préstamos Activos" value="12" icon="🔄" />
          <StatCard title="Equipos Disponibles" value="58" icon="✅" />
          <StatCard title="Total de Usuarios" value="134" icon="👥" />
          <StatCard title="Préstamos Hoy" value="8" icon="🗓️" />
        </View>
        {/* Later, we will add more sections like recent activity and charts */}
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { fontSize: isMobile ? 14 : 16 }]}>
            Más reportes y gráficos aparecerán aquí.
          </Text>
        </View>
>>>>>>> Stashed changes
      </View>

      {/* Modal */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 24,
    ...Platform.select({
      web: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
    }),
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
<<<<<<< Updated upstream
    padding: 20,
    marginBottom: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
=======
    marginBottom: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
>>>>>>> Stashed changes
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#8899A8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardValue: {
    color: '#0A2540',
<<<<<<< Updated upstream
  },
  cardTapIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
=======
    fontWeight: 'bold',
>>>>>>> Stashed changes
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  placeholderText: {
    color: '#8899A8',
    textAlign: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  
  // Filter Styles
  filtersContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusFilterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // List Styles
  modalList: {
    flex: 1,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
    flex: 1,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listItemDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});

export default AdminDashboard;
