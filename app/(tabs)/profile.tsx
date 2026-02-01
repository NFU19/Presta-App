import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { Header } from '@/components/header';
import { SideMenu } from '../../components/shared/side-menu';
import { auth } from '../../firebaseConfig';
import { useResponsive } from '@/hooks/use-responsive';

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
  const { width } = useWindowDimensions();
  const { isMobile, isTablet, isDesktop, isWeb } = useResponsive();

  // Responsive values
  const avatarSize = isMobile ? 80 : isTablet ? 100 : 120;
  const headerPadding = isMobile ? 16 : isTablet ? 24 : 32;
  const sectionPadding = isMobile ? 16 : isTablet ? 24 : 32;
  const contentMaxWidth = isDesktop ? 800 : width;

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
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
          {/* Header con información del usuario */}
          <View style={[styles.header, { padding: headerPadding }]}>
            <Image
              source={{ uri: userProfile?.avatar }}
              style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { fontSize: isMobile ? 22 : isTablet ? 26 : 30 }]}>{userProfile?.nombre}</Text>
              <Text style={[styles.userEmail, { fontSize: isMobile ? 14 : 16 }]}>{userProfile?.email}</Text>
            </View>
          </View>

          {/* Información Personal */}
          <View style={[styles.section, { paddingHorizontal: sectionPadding }]}>
            <Text style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 20 }]}>Información Personal</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: isMobile ? 14 : 16 }]}>Nombre</Text>
              <Text style={[styles.infoValue, { fontSize: isMobile ? 14 : 16 }]}>{userProfile?.nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: isMobile ? 14 : 16 }]}>Email</Text>
              <Text style={[styles.infoValue, { fontSize: isMobile ? 14 : 16 }]}>{userProfile?.email}</Text>
            </View>
          </View>

          {/* Direcciones */}
          <View style={[styles.section, { paddingHorizontal: sectionPadding }]}>
            <Text style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 20 }]}>Direcciones</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: isMobile ? 14 : 16 }]}>Casa</Text>
              <Text style={[styles.infoValue, { fontSize: isMobile ? 14 : 16 }]}>123 Calle Falsa, Springfield</Text>
            </View>
          </View>

          {/* Información de Pago */}
          <View style={[styles.section, { paddingHorizontal: sectionPadding }]}>
            <Text style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 20 }]}>Información de Pago</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { fontSize: isMobile ? 14 : 16 }]}>Tarjeta de Crédito</Text>
              <Text style={[styles.infoValue, { fontSize: isMobile ? 14 : 16 }]}>**** **** **** 1234</Text>
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={[styles.actionButtons, { padding: sectionPadding, flexDirection: isDesktop ? 'row' : 'column' }]}>
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { backgroundColor: Colors.light.error },
                isWeb && styles.actionButtonWeb
              ]}
              onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={isMobile ? 20 : 24} color="#fff" />
              <Text style={[styles.actionButtonText, { fontSize: isMobile ? 14 : 16 }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
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
        elevation: 2,
      }
    }),
  },
  avatar: {
    marginRight: 16,
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease',
      },
    }),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.light.textDark,
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.light.gray,
  },
  section: {
    marginTop: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }
    }),
  },
  sectionTitle: {
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
    alignItems: 'flex-start',
    gap: 16,
  },
  infoLabel: {
    color: Colors.light.gray,
    flex: 1,
  },
  infoValue: {
    color: Colors.light.textDark,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionButtonWeb: {
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        ':hover': {
          opacity: 0.9,
          transform: 'translateY(-2px)',
        },
      },
    }),
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
