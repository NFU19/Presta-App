import { Header } from '@/components/header';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ProductDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  
  // Datos del producto que vendrían de los parámetros
  const product = {
    id: params.id as string,
    nombre: params.nombre as string,
    categoria: params.categoria as string,
    estado: params.estado === 'true',
    imagen: params.imagen as string,
  };

  const handleRequestLoan = () => {
    router.push({
      pathname: '/loan-request-modal' as any,
      params: {
        id: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
      },
    });
  };

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
  };

  const handleViewHistory = () => {
    setIsHistoryModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <Header showBackButton onBackPress={() => router.back()} />
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Detalles del Producto</Text>
          <TouchableOpacity onPress={handleAddToFavorites} style={styles.favoriteButton}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={Colors.light.error} />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imagen || 'https://via.placeholder.com/300' }}
            style={styles.productImage}
          />
          <View style={[
            styles.availabilityBadge,
            { backgroundColor: product.estado ? '#28a745' : '#dc3545' }
          ]}>
            <Text style={styles.availabilityText}>
              {product.estado ? 'Disponible' : 'No Disponible'}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.nombre}</Text>
          <Text style={styles.productCategory}>{product.categoria}</Text>
          
          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Información del Equipo</Text>
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={20} color="#525f7f" />
              <Text style={styles.detailText}>Código: {product.id?.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={20} color="#525f7f" />
              <Text style={styles.detailText}>Categoría: {product.categoria}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#525f7f" />
              <Text style={styles.detailText}>Tiempo máximo de préstamo: 7 días</Text>
            </View>
          </View>

          {/* Specifications Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Especificaciones</Text>
            <View style={styles.specsContainer}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Estado:</Text>
                <Text style={styles.specValue}>Excelente</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Último mantenimiento:</Text>
                <Text style={styles.specValue}>15/10/2024</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Ubicación:</Text>
                <Text style={styles.specValue}>Laboratorio A-201</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Responsable:</Text>
                <Text style={styles.specValue}>Administrador</Text>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.featureText}>Estado: Excelente</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.featureText}>Mantenimiento al día</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.featureText}>Incluye accesorios</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.featureText}>Manual de usuario disponible</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: product.estado ? '#007bff' : '#6c757d' }
              ]}
              onPress={handleRequestLoan}
              disabled={!product.estado}
            >
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {product.estado ? 'Solicitar Préstamo' : 'No Disponible'}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
                <Ionicons name="time-outline" size={18} color="#007bff" />
                <Text style={styles.secondaryButtonText}>Ver Historial</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            <Text style={styles.infoText}>
              Para solicitar el préstamo de este equipo, presiona el botón &quot;Solicitar Préstamo&quot;. 
              Tu solicitud será revisada por el administrador y recibirás una notificación con la respuesta.
            </Text>
            <Text style={styles.infoText}>
              Recuerda que debes devolver el equipo en las mismas condiciones en que lo recibiste 
              y dentro del plazo establecido.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isHistoryModalVisible}
        onRequestClose={() => {
          setIsHistoryModalVisible(!isHistoryModalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Historial del Equipo</Text>
            <View style={styles.historyItem}>
              <Text style={styles.historyItemText}>- Prestado a Juan Perez</Text>
              <Text style={styles.historyItemDate}>15/10/2024 - 22/10/2024</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyItemText}>- Mantenimiento</Text>
              <Text style={styles.historyItemDate}>10/10/2024</Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsHistoryModalVisible(!isHistoryModalVisible)}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundAlt,
  },
  imageContainer: {
    backgroundColor: Colors.light.background,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 280,
    height: 220,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 30,
    right: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  productInfo: {
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  productCategory: {
    fontSize: 16,
    color: Colors.light.gray,
    marginBottom: 24,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: Colors.light.gray,
    marginLeft: 12,
    lineHeight: 22,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundAlt,
    padding: 12,
    borderRadius: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.textDark,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 28,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundAlt,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.light.textDark,
    fontWeight: '600',
  },
  infoSection: {
    borderTopWidth: 1.5,
    borderTopColor: Colors.light.border,
    paddingTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.gray,
    lineHeight: 22,
    marginBottom: 16,
  },
  specsContainer: {
    gap: 12,
    backgroundColor: Colors.light.backgroundAlt,
    padding: 16,
    borderRadius: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.light.gray,
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    textAlign: 'right',
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
  historyItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyItemText: {
    fontSize: 16,
  },
  historyItemDate: {
    fontSize: 14,
    color: Colors.light.gray,
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

export default ProductDetailsScreen;