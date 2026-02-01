import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Animated, Easing, FlatList, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import React, { useState } from 'react';
import { FavoriteProductCard } from '@/components/shared/favorite-product-card';
import { useResponsive } from '@/hooks/use-responsive';

const FavoritesScreen = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { width } = useWindowDimensions();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Responsive values
  const numColumns = width < 576 ? 1 : width < 768 ? 2 : width < 1200 ? 3 : 4;
  const headerPadding = isMobile ? 16 : isTablet ? 20 : 24;
  const contentMaxWidth = isDesktop ? 1200 : width;

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

  const favorites = [
    { id: '1', name: 'Laptop Dell XPS', tipo: 'Laptop', estado: true, imagen: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9520/media-gallery/touch-black/notebook-xps-15-9520-t-black-gallery-4.psd?fmt=pjpg&pscan=auto&scl=1&wid=4394&hei=2732&qlt=100,0&resMode=sharp2&size=4394,2732&chrss=full' },
    { id: '2', name: 'Monitor LG 27"', tipo: 'Monitor', estado: true, imagen: 'https://www.lg.com/content/dam/channel/wcms/mx/images/monitores/27gp750-b_awp_espr_mx_c/27GP750-B-450.jpg' },
    { id: '3', name: 'Teclado Mecánico', tipo: 'Teclado', estado: false, imagen: 'https://resource.logitechg.com/w_692,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-keyboard/pro-x-keyboard-gallery-1.png' },
    { id: '4', name: 'Mouse Logitech MX Master 3', tipo: 'Mouse', estado: true, imagen: 'https://resource.logitech.com/w_692,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-gallery-1-graphite.png' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <FavoriteProductCard item={item} onPress={() => {}} />
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
      <View style={[styles.header, { padding: headerPadding }]}>
        <Text style={[styles.title, { fontSize: isMobile ? 24 : isTablet ? 28 : 32 }]}>Mis Favoritos</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          key={numColumns}
          numColumns={numColumns}
          contentContainerStyle={[
            styles.list,
            { 
              paddingHorizontal: isMobile ? 8 : isTablet ? 12 : 16,
              maxWidth: contentMaxWidth,
            }
          ]}
          columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
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
  title: {
    fontWeight: 'bold',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  list: {
    paddingVertical: 16,
  },
});

export default FavoritesScreen;
