
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Animated, Easing, FlatList, Modal, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { Prestamo } from '../../types/prestamo';
import { obtenerPrestamosUsuario } from '../../services/prestamoService';

const HistoryScreen = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
  const [expandedPrestamo, setExpandedPrestamo] = useState<string | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadPrestamos();
  }, []);

  const loadPrestamos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      const prestamosData = await obtenerPrestamosUsuario(user.uid);
      setPrestamos(prestamosData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrestamos();
    setRefreshing(false);
  };

  const toggleMenu = () => {
    const springConfig = {
      damping: 20,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
    };

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: isMenuVisible ? -300 : 0,
        ...springConfig,
      }),
      Animated.timing(fadeAnim, {
        toValue: isMenuVisible ? 0 : 1,
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ]).start();
    setIsMenuVisible(!isMenuVisible);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return Colors.light.success;
      case 'devuelto':
        return Colors.light.gray;
      case 'vencido':
        return Colors.light.error;
      case 'pendiente':
        return '#ffc107';
      case 'aprobado':
        return '#17a2b8';
      case 'rechazado':
        return '#6c757d';
      default:
        return Colors.light.gray;
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      activo: 'Activo',
      devuelto: 'Devuelto',
      vencido: 'Vencido',
      rechazado: 'Rechazado',
    };
    return labels[estado] || estado;
  };

  const handlePrestamoPress = (prestamo: Prestamo) => {
    setSelectedPrestamo(prestamo);
    setIsModalVisible(true);
  };

  const toggleExpand = (prestamoId: string) => {
    setExpandedPrestamo(expandedPrestamo === prestamoId ? null : prestamoId);
  };

  const renderItem = ({ item }: { item: Prestamo }) => (
    <TouchableOpacity onPress={() => handlePrestamoPress(item)}>
      <View style={styles.prestamoCard}>
        <View style={styles.prestamoHeader}>
          <Text style={styles.prestamoEquipo}>{item.equipoNombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>
              {getEstadoLabel(item.estado)}
            </Text>
          </View>
        </View>
        <View style={styles.prestamoDetails}>
          {item.estado === 'pendiente' && (
            <View style={styles.dateInfo}>
              <Ionicons name="hourglass-outline" size={16} color={Colors.light.gray} />
              <Text style={styles.dateText}>
                Esperando aprobación
              </Text>
            </View>
          )}
          {item.fechaPrestamo && (
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={16} color={Colors.light.gray} />
              <Text style={styles.dateText}>
                Prestado: {formatDate(item.fechaPrestamo)}
              </Text>
            </View>
          )}
          {item.fechaDevolucion && (
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={16} color={Colors.light.gray} />
              <Text style={styles.dateText}>
                Devolución: {formatDate(item.fechaDevolucion)}
              </Text>
            </View>
          )}
          {item.duracionDias && (
            <View style={styles.dateInfo}>
              <Ionicons name="timer-outline" size={16} color={Colors.light.gray} />
              <Text style={styles.dateText}>
                Duración: {item.duracionDias} día{item.duracionDias !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onMenuPress={toggleMenu} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={toggleMenu} />
      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Mis Préstamos</Text>
        <Text style={styles.subtitle}>
          {prestamos.filter(p => p.estado === 'activo').length} préstamos activos
        </Text>
      </View>
      {prestamos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={64} color={Colors.light.gray} />
          <Text style={styles.emptyText}>No tienes préstamos aún</Text>
          <Text style={styles.emptySubtext}>Solicita un equipo desde el Dashboard</Text>
        </View>
      ) : (
        <FlatList
          data={prestamos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      {selectedPrestamo && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(!isModalVisible);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalles del Préstamo</Text>
              
              {selectedPrestamo.codigoQR && (
                <>
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedPrestamo.codigoQR}` }}
                    style={styles.qrCode}
                  />
                  <Text style={styles.qrLabel}>Código QR</Text>
                </>
              )}
              
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>📦 {selectedPrestamo.equipoNombre}</Text>
                <Text style={styles.modalText}>
                  📅 Devolución: {formatDate(selectedPrestamo.fechaDevolucion)}
                </Text>
                <Text style={styles.modalText}>
                  ⏱️ Duración: {selectedPrestamo.duracionDias} días
                </Text>
                <Text style={styles.modalText}>
                  📝 Propósito: {selectedPrestamo.proposito}
                </Text>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(selectedPrestamo.estado), alignSelf: 'center', marginTop: 12 }]}>
                  <Text style={styles.estadoText}>
                    {getEstadoLabel(selectedPrestamo.estado)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(!isModalVisible)}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.light.gray,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.gray,
    marginTop: 8,
  },
  list: {
    padding: 20,
  },
  prestamoCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prestamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prestamoEquipo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textDark,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  prestamoDetails: {
    gap: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  expandButtonText: {
    color: Colors.light.primary,
    marginRight: 4,
  },
  productList: {
    marginTop: 8,
  },
  productoText: {
    fontSize: 14,
    color: Colors.light.gray,
    marginLeft: 16,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.primary,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
  },
  qrLabel: {
    fontSize: 12,
    color: Colors.light.gray,
    marginBottom: 16,
  },
  modalDetails: {
    width: '100%',
    gap: 8,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 4,
    color: Colors.light.text,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryScreen;
