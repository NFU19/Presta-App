import { GridProductCard } from '@/components/shared/grid-product-card';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, doc, onSnapshot as onDocSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import { useResponsive } from '@/hooks/use-responsive';

// Define the structure of an Equipo
interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  tipo?: string;
  estado?: boolean;
  imagen?: string;
}

const CatalogScreen = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const { width, isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const unsubscribeEquipos = onSnapshot(
      collection(db, 'equipos'),
      snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Equipo),
        }));
        setEquipos(data);
        setLoading(false);
      },
      error => {
        console.error('Error al obtener equipos', error);
        Alert.alert('Error', 'No se pudieron cargar los equipos.');
        setLoading(false);
      }
    );

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'usuarios', user.uid);
      const unsubscribeUser = onDocSnapshot(
        userRef,
        snap => {
          const favs = (snap.data()?.favoritos as string[] | undefined) || [];
          setFavoriteIds(favs);
          setFavoritesLoaded(true);
        },
        () => setFavoritesLoaded(true)
      );

      return () => {
        unsubscribeEquipos();
        unsubscribeUser();
      };
    }

    setFavoritesLoaded(true);
    return () => unsubscribeEquipos();
  }, []);

  // Calcular número de columnas basado en el ancho de pantalla
  const getNumColumns = () => {
    if (width >= 1400) return 5; // XL screens
    if (width >= 1200) return 4; // Large desktop
    if (width >= 992) return 3;  // Desktop
    if (width >= 768) return 2;  // Tablet
    return 2; // Mobile ahora muestra grid de 2 columnas
  };

  const numColumns = getNumColumns();

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

  const handleToggleFavorite = async (item: Equipo) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar favoritos.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a login', onPress: () => router.replace('/login') },
      ]);
      return;
    }

    const userRef = doc(db, 'usuarios', user.uid);
    try {
      await setDoc(userRef, { favoritos: [] }, { merge: true });
      const alreadyFav = favoriteIds.includes(item.id);
      if (alreadyFav) {
        await updateDoc(userRef, { favoritos: arrayRemove(item.id) });
      } else {
        await updateDoc(userRef, { favoritos: arrayUnion(item.id) });
      }
    } catch (error) {
      console.error('Error al actualizar favoritos', error);
      Alert.alert('Error', 'No pudimos actualizar tus favoritos.');
    }
  };

  const handleProductPress = (item: Equipo) => {
    router.push({
      pathname: '../product-details' as any,
      params: {
        id: item.id,
        nombre: item.nombre,
        categoria: item.categoria || 'Sin categoría',
        estado: item.estado?.toString() || 'false',
        imagen: item.imagen || 'https://via.placeholder.com/300',
      },
    });
  };

  const normalize = (text?: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const displayedEquipos = equipos.filter((equipo) => {
    if (!searchQuery) return true;
    const q = normalize(searchQuery);
    return (
      normalize(equipo.nombre).includes(q) ||
      normalize(equipo.tipo).includes(q) ||
      normalize((equipo as any).categoria).includes(q) ||
      normalize((equipo as any).codigo)?.includes?.(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={toggleMenu}>
        <View style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={isSearchFocused ? Colors.light.primary : Colors.light.gray} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar equipos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholderTextColor={Colors.light.gray}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            inputMode="search"
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsSearchFocused(true);
            }}
          />
        </View>
      </Header>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Catálogo</Text>
      </View>

      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
      ) : (
        <FlatList
          key={numColumns} // Importante: forzar re-render cuando cambian las columnas
          data={displayedEquipos}
          renderItem={({ item }) => (
            <GridProductCard
              item={item}
              onPress={() => handleProductPress(item)}
              onToggleFavorite={() => handleToggleFavorite(item)}
              isFavorite={favoriteIds.includes(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={[
            styles.list,
            {
              paddingHorizontal: isMobile ? 12 : isTablet ? 20 : 32,
            }
          ]}
          columnWrapperStyle={numColumns > 1 ? { gap: isMobile ? 12 : 16 } : undefined}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundAlt,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 180,
  },
  searchContainerFocused: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.textDark,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  // Menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: Colors.light.background,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
  list: {
    paddingHorizontal: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default CatalogScreen;
