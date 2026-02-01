import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';

// Interfaces
interface Equipo {
  id: string;
  nombre: string;
  tipo?: string;
  estado?: boolean;
  imagen?: string;
}

// Componente de Tarjeta de Producto para Grilla
export const GridProductCard = ({ item, onPress }: { item: Equipo; onPress: () => void }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  return (
    <TouchableOpacity 
      style={[
        styles.productCard,
        {
          height: isMobile ? 260 : isTablet ? 280 : 300,
          margin: isMobile ? 6 : 8,
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={[
          styles.imageContainer,
          { height: isMobile ? 140 : isTablet ? 160 : 180 }
        ]}>
          <Image
            source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
        </View>
        <View style={[styles.productInfo, { padding: isMobile ? 10 : 12 }]}>
          <Text 
            style={[
              styles.productName,
              { fontSize: isMobile ? 14 : 16 }
            ]} 
            numberOfLines={1}
          >
            {item.nombre}
          </Text>
          <Text 
            style={[
              styles.productType,
              { fontSize: isMobile ? 12 : 13 }
            ]}
          >
            {item.tipo || 'Sin tipo'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: item.estado ? Colors.light.success : Colors.light.error,
              paddingVertical: isMobile ? 4 : 6,
              paddingHorizontal: isMobile ? 8 : 10,
            }
          ]}>
            <Text style={[
              styles.statusText,
              { fontSize: isMobile ? 11 : 12 }
            ]}>
              {item.estado ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    } : {}),
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: '600',
    color: Colors.light.textDark,
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: Colors.light.gray,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '500',
  },
});
