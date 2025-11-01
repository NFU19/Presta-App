import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import { auth } from '../../firebaseConfig';

import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  nombre: string;
  email: string;
  role: string;
  avatar?: string;
}

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const pathname = usePathname();

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

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      // Por ahora usaremos datos simulados para Marlon
      setUserProfile({
        nombre: 'Marlon',
        email: 'marlon@gmail.com',
        role: 'usuario',
        avatar: 'https://ui-avatars.com/api/?name=Marlon&background=1a3a6b&color=fff',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={toggleMenu} />
      <SideMenu
        isVisible={isMenuVisible}
        onClose={toggleMenu}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <Image
          source={{ uri: userProfile?.avatar }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile?.nombre}</Text>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
        </View>
      </View>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre</Text>
          <Text style={styles.infoValue}>{userProfile?.nombre}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userProfile?.email}</Text>
        </View>
      </View>

      {/* Direcciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direcciones</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Casa</Text>
          <Text style={styles.infoValue}>123 Calle Falsa, Springfield</Text>
        </View>
      </View>

      {/* Información de Pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Pago</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarjeta de Crédito</Text>
          <Text style={styles.infoValue}>**** **** **** 1234</Text>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.light.error }]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.gray,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.textDark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.light.gray,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.textDark,
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
