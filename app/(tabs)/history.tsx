
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Animated, Easing, FlatList, Modal, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Platform, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { Prestamo } from '../../types/prestamo';
import { obtenerPrestamosUsuario } from '../../services/prestamoService';
import { useResponsive } from '@/hooks/use-responsive';

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
  const { width } = useWindowDimensions();
  const { isMobile, isTablet, isDesktop, isWeb } = useResponsive();

  // Responsive values
  const numColumns = width < 768 ? 1 : width < 1200 ? 2 : 3;
  const cardPadding = isMobile ? 12 : 16;
  const contentMaxWidth = isDesktop ? 1200 : width;

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

  const handleCancelar = (prestamo: Prestamo) => {
    Alert.alert(
      'Cancelar solicitud',
      `¿Deseas cancelar la solicitud de ${prestamo.equipoNombre}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => console.log('Cancelar préstamo', prestamo.id) },
      ]
    );
  };

  const handleDevolver = (prestamo: Prestamo) => {
    Alert.alert(
      'Registrar devolución',
      `Confirma la devolución de ${prestamo.equipoNombre}.`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Devolver', onPress: () => console.log('Devolver préstamo', prestamo.id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Prestamo }) => (
    <TouchableOpacity 
      onPress={() => handlePrestamoPress(item)}
      activeOpacity={0.9}
      style={{ flex: 1, maxWidth: numColumns > 1 ? '48%' : '100%' }}>
      <View style={[
        styles.prestamoCard, 
        { padding: cardPadding },
        isWeb && styles.prestamoCardWeb
      ]}>
        <View style={styles.prestamoHeader}>
          <Text style={[styles.prestamoEquipo, { fontSize: isMobile ? 16 : 18 }]}>{item.equipoNombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={[styles.estadoText, { fontSize: isMobile ? 11 : 12 }]}>
              {getEstadoLabel(item.estado)}
            </Text>
          </View>
        </View>
        <View style={styles.prestamoDetails}>
          {item.estado === 'pendiente' && (
            <View style={styles.dateInfo}>
              <Ionicons name="hourglass-outline" size={isMobile ? 14 : 16} color={Colors.light.gray} />
              <Text style={[styles.dateText, { fontSize: isMobile ? 12 : 14 }]}>
                Esperando aprobación
              </Text>
            </View>
          )}
          {item.fechaPrestamo && (
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={isMobile ? 14 : 16} color={Colors.light.gray} />
              <Text style={[styles.dateText, { fontSize: isMobile ? 12 : 14 }]}>
                Prestado: {formatDate(item.fechaPrestamo)}
              </Text>
            </View>
          )}
          {item.fechaDevolucion && (
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={isMobile ? 14 : 16} color={Colors.light.gray} />
              <Text style={[styles.dateText, { fontSize: isMobile ? 12 : 14 }]}>
                Devolución: {formatDate(item.fechaDevolucion)}
              </Text>
            </View>
          )}
          {item.duracionDias && (
            <View style={styles.dateInfo}>
              <Ionicons name="timer-outline" size={isMobile ? 14 : 16} color={Colors.light.gray} />
              <Text style={[styles.dateText, { fontSize: isMobile ? 12 : 14 }]}>
                Duración: {item.duracionDias} día{item.duracionDias !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardActionsRow}>
          {item.estado === 'pendiente' && (
            <TouchableOpacity style={[styles.actionChip, styles.actionChipOutline]} onPress={() => handleCancelar(item)}>
              <Ionicons name="close-circle" size={16} color={Colors.light.error} />
              <Text style={[styles.actionChipText, { color: Colors.light.error }]}>Cancelar</Text>
            </TouchableOpacity>
          )}
          {(item.estado === 'activo' || item.estado === 'aprobado') && (
            <TouchableOpacity style={styles.actionChip} onPress={() => handleDevolver(item)}>
              <Ionicons name="return-down-back" size={16} color="#fff" />
              <Text style={[styles.actionChipText, { color: '#fff' }]}>Devolver</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onMenuPress={toggleMenu}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mis Préstamos</Text>
          </View>
        </Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.secondary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={toggleMenu}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mis Préstamos</Text>
            <Text style={styles.subtitle}>
              {prestamos.filter(p => p.estado === 'activo').length} préstamos activos
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </Header>
      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
      />
      <View style={{ height: 12 }} />
      {prestamos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={isMobile ? 48 : 64} color={Colors.light.gray} />
          <Text style={[styles.emptyText, { fontSize: isMobile ? 16 : 18 }]}>No tienes préstamos aún</Text>
          <Text style={[styles.emptySubtext, { fontSize: isMobile ? 13 : 14 }]}>Solicita un equipo desde el Dashboard</Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <FlatList
            data={prestamos}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            key={numColumns}
            numColumns={numColumns}
            contentContainerStyle={[
              styles.list,
              { 
                paddingHorizontal: isMobile ? 12 : isTablet ? 20 : 32,
                maxWidth: contentMaxWidth,
              }
            ]}
            columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
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
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.light.textDark,
    letterSpacing: -0.5,
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.light.gray,
    marginTop: 2,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    color: Colors.light.gray,
    marginTop: 8,
  },
  list: {
    paddingVertical: 20,
  },
  prestamoCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  prestamoCardWeb: {
    ...Platform.select({
      web: {
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    }),
  },
  prestamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  prestamoEquipo: {
    fontWeight: '600',
    color: Colors.light.textDark,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
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
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionChipOutline: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  actionChipText: {
    fontWeight: '700',
    color: Colors.light.textDark,
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
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
