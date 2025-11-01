import { ProductCard } from '@/components/shared/product-card';
import { Header } from '@/components/header';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, DocumentData, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SideMenu } from '../../components/shared/side-menu';
import { db } from '../../firebaseConfig';
// Interfaces
interface Equipo {
  id: string;
  nombre: string;
  tipo?: string;
  estado?: boolean;
  imagen?: string;
}

// Componente de Carrusel Horizontal
const HorizontalCarousel = ({ title, data, onItemPress }: { title: string; data: Equipo[]; onItemPress: (item: Equipo) => void }) => (
  <View style={styles.carouselContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard item={item} onPress={() => onItemPress(item)} />
      )}
      contentContainerStyle={styles.carouselContent}
    />
  </View>
);

// Componente Principal
const DashboardScreen = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Animaciones del menú lateral
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0]; // Valor para la opacidad del fondo

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

  // Cargar datos de Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'equipos'), (snapshot) => {
      const equiposData: Equipo[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        nombre: doc.data().nombre || 'Nombre no disponible',
        tipo: doc.data().tipo || 'Sin tipo',
        estado: doc.data().estado !== undefined ? doc.data().estado : true,
        imagen: doc.data().imagen,
      }));
      setEquipos(equiposData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProductPress = (item: Equipo) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: item.id,
        nombre: item.nombre,
        categoria: item.tipo || 'Sin tipo',
        estado: item.estado?.toString() || 'false',
        imagen: item.imagen || 'https://via.placeholder.com/300',
      },
    });
  };

  // Filtrar productos por búsqueda
  const displayedEquipos = equipos.filter(equipo =>
    searchQuery === '' || 
    equipo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipo.tipo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header onMenuPress={toggleMenu}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.light.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar equipos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.gray}
          />
        </View>
      </Header>

      {/* Menú Lateral */}
      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
      />

      {/* Contenido Principal */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Los más Reservados */}
        <HorizontalCarousel
          title="Los más Reservados"
          data={displayedEquipos.slice(0, 5)}
          onItemPress={handleProductPress}
        />

        <HorizontalCarousel
          title="Recomendados para Ti"
          data={displayedEquipos.slice(5, 11)}
          onItemPress={handleProductPress}
        />

        {/* Seguir Reservando */}
        <HorizontalCarousel
          title="Seguir Reservando"
          data={displayedEquipos.slice(0, 5).reverse()}
          onItemPress={handleProductPress}
        />
      </ScrollView>
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
    backgroundColor: Colors.light.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundAlt,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundAlt,
    marginLeft: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.textDark,
  },
  mainContent: {
    flex: 1,
  },
  carouselContainer: {
    marginTop: 24,
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
    letterSpacing: -0.5,
  },
});

export default DashboardScreen;