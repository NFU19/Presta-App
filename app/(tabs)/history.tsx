
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Animated, Easing, FlatList, Modal, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import React, { useState } from 'react';

const HistoryScreen = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [expandedPrestamo, setExpandedPrestamo] = useState(null);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

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

  const prestamos = [
    {
      id: '1',
      equipoId: 'eq1',
      nombreEquipo: 'Laptop Dell XPS',
      fechaPrestamo: new Date('2025-10-25'),
      fechaDevolucion: new Date('2025-11-05'),
      estado: 'activo',
    },
    {
      id: '2',
      equipoId: 'eq2',
      nombreEquipo: 'Monitor LG 27"',
      fechaPrestamo: new Date('2025-10-15'),
      fechaDevolucion: new Date('2025-10-22'),
      estado: 'devuelto',
    },
    {
      id: '3',
      equipoId: 'eq3',
      nombreEquipo: 'Teclado Mecánico',
      fechaPrestamo: new Date('2025-09-28'),
      fechaDevolucion: new Date('2025-10-05'),
      estado: 'vencido',
    },
    {
      id: '4',
      equipoId: 'eq4',
      nombreEquipo: 'Varios productos',
      fechaPrestamo: new Date('2025-10-28'),
      fechaDevolucion: new Date('2025-11-10'),
      estado: 'activo',
      productos: [
        { id: 'p1', nombre: 'Cargador para Laptop' },
        { id: 'p2', nombre: 'Cable HDMI' },
        { id: 'p3', nombre: 'Adaptador USB-C' },
      ]
    },
  ];

  const formatDate = (date: Date) => {
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
      default:
        return Colors.light.gray;
    }
  };

  const handlePrestamoPress = (prestamo) => {
    if (prestamo.estado === 'activo') {
      setSelectedPrestamo(prestamo);
      setIsModalVisible(true);
    }
  };

  const toggleExpand = (prestamoId) => {
    setExpandedPrestamo(expandedPrestamo === prestamoId ? null : prestamoId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePrestamoPress(item)}>
      <View style={styles.prestamoCard}>
        <View style={styles.prestamoHeader}>
          <Text style={styles.prestamoEquipo}>{item.nombreEquipo}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>
              {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.prestamoDetails}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={16} color={Colors.light.gray} />
            <Text style={styles.dateText}>
              Prestado: {formatDate(item.fechaPrestamo)}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="time-outline" size={16} color={Colors.light.gray} />
            <Text style={styles.dateText}>
              Devolución: {formatDate(item.fechaDevolucion)}
            </Text>
          </View>
        </View>
        {item.productos && (
          <View>
            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.expandButton}>
              <Text style={styles.expandButtonText}>
                {expandedPrestamo === item.id ? 'Ocultar productos' : 'Ver productos'}
              </Text>
              <Ionicons name={expandedPrestamo === item.id ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            {expandedPrestamo === item.id && (
              <View style={styles.productList}>
                {item.productos.map((producto) => (
                  <Text key={producto.id} style={styles.productoText}>- {producto.nombre}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
      </View>
      <FlatList
        data={prestamos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
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
              <Text style={styles.modalTitle}>Préstamo Activo</Text>
              <Image
                source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=prestamo-' + selectedPrestamo.id }}
                style={styles.qrCode}
              />
              <Text style={styles.modalText}>Equipo: {selectedPrestamo.nombreEquipo}</Text>
              <Text style={styles.modalText}>Fecha de devolución: {formatDate(selectedPrestamo.fechaDevolucion)}</Text>
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
