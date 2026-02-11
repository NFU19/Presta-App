import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
export const GridProductCard = ({ item, onPress, onToggleFavorite, isFavorite }: { item: Equipo; onPress: () => void; onToggleFavorite?: () => void; isFavorite?: boolean; }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const cardHeight = isMobile ? 230 : isTablet ? 250 : 260;
  const imageBlock = isMobile ? 120 : isTablet ? 140 : 150;
  
  return (
    <TouchableOpacity 
      style={[
        styles.productCard,
        {
          height: cardHeight,
          margin: isMobile ? 6 : 8,
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.imageContainer,
            {
              height: imageBlock,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: Colors.light.border,
            },
          ]}
        >
          <Image
            source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          {onToggleFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={Colors.light.error} />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.productInfo, { padding: isMobile ? 10 : 12 }]}>
          <Text
            style={[
              styles.productName,
              {
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? 18 : 20,
              },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.9}
          >
            {item.nombre}
          </Text>
          <Text
            style={[
              styles.productType,
              { fontSize: isMobile ? 12 : 13 }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.tipo || 'Sin tipo'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: item.estado ? '#e6f4ef' : '#fbe9eb',
              paddingVertical: isMobile ? 4 : 6,
              paddingHorizontal: isMobile ? 8 : 10,
            }
          ]}>
            <Text style={[
              styles.statusText,
              {
                fontSize: isMobile ? 11 : 12,
                color: item.estado ? Colors.light.success : Colors.light.error,
              }
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
    overflow: 'hidden',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  productName: {
    fontWeight: '600',
    color: Colors.light.textDark,
    marginBottom: 2,
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
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});
