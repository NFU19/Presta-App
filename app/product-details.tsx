import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ProductDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Datos del producto que vendrían de los parámetros
  const product = {
    id: params.id as string,
    nombre: params.nombre as string,
    categoria: params.categoria as string,
    disponible: params.disponible === 'true',
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
    Alert.alert('Favoritos', 'Producto agregado a favoritos');
  };

  const handleReportIssue = () => {
    Alert.alert('Reportar Problema', 'Función de reporte disponible próximamente');
  };

  const handleViewHistory = () => {
    Alert.alert('Historial', 'Ver historial de préstamos de este equipo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0A2540" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Producto</Text>
          <TouchableOpacity onPress={handleAddToFavorites} style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#ff6b6b" />
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
            { backgroundColor: product.disponible ? '#28a745' : '#dc3545' }
          ]}>
            <Text style={styles.availabilityText}>
              {product.disponible ? 'Disponible' : 'No Disponible'}
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
                { backgroundColor: product.disponible ? '#007bff' : '#6c757d' }
              ]}
              onPress={handleRequestLoan}
              disabled={!product.disponible}
            >
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {product.disponible ? 'Solicitar Préstamo' : 'No Disponible'}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
                <Ionicons name="time-outline" size={18} color="#007bff" />
                <Text style={styles.secondaryButtonText}>Ver Historial</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleReportIssue}>
                <Ionicons name="warning-outline" size={18} color="#ffc107" />
                <Text style={styles.secondaryButtonText}>Reportar Problema</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2540',
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: 250,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 30,
    right: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productInfo: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: '#525f7f',
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2540',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#525f7f',
    marginLeft: 8,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#525f7f',
    marginLeft: 8,
  },
  actionsSection: {
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ea',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#525f7f',
    fontWeight: '500',
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: '#dfe4ea',
    paddingTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#525f7f',
    lineHeight: 20,
    marginBottom: 12,
  },
  specsContainer: {
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 14,
    color: '#525f7f',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#0A2540',
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default ProductDetailsScreen;