import { Header } from "@/components/header";
import { ProductCard } from "@/components/shared/product-card";
import { KeyboardDismissWrapper } from "@/components/ui/keyboard-dismiss-wrapper";
import { Colors } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    DocumentData,
    onSnapshot,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SideMenu } from "../../components/shared/side-menu";
import { db } from "../../firebaseConfig";

// Interfaces
interface Equipo {
  id: string;
  nombre: string;
  tipo?: string;
  estado?: boolean;
  imagen?: string;
}

// Componente de Carrusel Horizontal
const HorizontalCarousel = ({
  title,
  data,
  onItemPress,
}: {
  title: string;
  data: Equipo[];
  onItemPress: (item: Equipo) => void;
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <View
      style={[
        styles.carouselContainer,
        {
          paddingHorizontal: isMobile ? 12 : isTablet ? 16 : 20,
          marginBottom: isMobile ? 16 : 20,
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          {
            fontSize: isMobile ? 18 : isTablet ? 20 : 22,
            marginBottom: isMobile ? 12 : 16,
          },
        ]}
      >
        {title}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard item={item} onPress={() => onItemPress(item)} />
        )}
        contentContainerStyle={[
          styles.carouselContent,
          { paddingHorizontal: isMobile ? 4 : 8 },
        ]}
      />
    </View>
  );
};

// Componente Principal
const DashboardScreen = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Animaciones del menú lateral
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
      }),
    ]).start();
    setIsMenuVisible(!isMenuVisible);
  };

  // Cargar datos de Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "equipos"), (snapshot) => {
      const equiposData: Equipo[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nombre: doc.data().nombre || "Nombre no disponible",
          tipo: doc.data().tipo || "Sin tipo",
          estado: doc.data().estado !== undefined ? doc.data().estado : true,
          imagen: doc.data().imagen,
        }),
      );
      setEquipos(equiposData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProductPress = (item: Equipo) => {
    router.push({
      pathname: "/product-details",
      params: {
        id: item.id,
        nombre: item.nombre,
        categoria: item.tipo || "Sin tipo",
        estado: item.estado?.toString() || "false",
        imagen: item.imagen || "https://via.placeholder.com/300",
      },
    });
  };

  // Filtrar productos por búsqueda (sin acentos)
  const normalize = (text?: string) =>
    (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardDismissWrapper>
        {/* Header */}
        <Header onMenuPress={toggleMenu}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused,
              ]}
            >
              <Ionicons
                name="search-outline"
                size={isMobile ? 18 : 20}
                color={
                  isSearchFocused ? Colors.light.primary : Colors.light.gray
                }
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { fontSize: isMobile ? 14 : 16 }]}
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
            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: isMobile ? 10 : 14 }]}
              onPress={() => router.push("/notifications")}
              accessibilityLabel="Abrir notificaciones"
            >
              <Ionicons
                name="notifications-outline"
                size={isMobile ? 18 : 20}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
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
        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: isMobile ? 20 : 30,
          }}
        >
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
      </KeyboardDismissWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 6,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundAlt,
  },
  mainContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "transparent",
    ...(Platform.OS === "web"
      ? {
          transition: "all 0.2s ease",
        }
      : {}),
  },
  searchContainerFocused: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.textDark,
    paddingRight: 4,
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none" as any,
        }
      : {}),
  },
  carouselContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: Colors.light.textDark,
  },
  carouselContent: {
    paddingVertical: 8,
  },
});

export default DashboardScreen;
