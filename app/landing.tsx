import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleLogin = () => {
    router.push('./login');
  };

  const scrollToSection = (sectionId: string) => {
    // Offset del header
    const headerOffset = Platform.OS === 'web' ? 120 : 100;
    
    // Calcular la posición de la sección
    let yOffset = 0;
    switch (sectionId) {
      case 'inicio':
        yOffset = 0;
        break;
      case 'catalogo':
        // altura del hero section - header offset
        yOffset = (Platform.OS === 'web' ? 700 : 500) - headerOffset;
        break;
      case 'como-funciona':
        // altura del hero + catálogo - header offset
        yOffset = (Platform.OS === 'web' ? 1200 : 900) - headerOffset;
        break;
    }

    // Realizar el scroll suave con un pequeño retraso para el menú móvil
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, Platform.OS === 'web' ? 0 : 300); // Retraso solo en móvil

    // Cerrar el menú móvil si está abierto
    setMenuOpen(false);
  };

  const CategoryItem = ({ icon, title }: { icon: string; title: string }) => (
    <View style={styles.categoryItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={32} color="#1a3a6b" />
      </View>
      <Text style={styles.categoryTitle}>{title}</Text>
    </View>
  );

  const StepItem = ({ number, title, description }: { number: number; title: string; description: string }) => (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>SG-PRESTAMOS</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.nav}>
              <TouchableOpacity onPress={() => scrollToSection('inicio')}>
                <Text style={styles.navItem}>Inicio</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection('catalogo')}>
                <Text style={styles.navItem}>Nuestros Equipos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection('como-funciona')}>
                <Text style={styles.navItem}>Cómo Funciona</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Ionicons 
                  name={menuOpen ? "close" : "menu"} 
                  size={28} 
                  color="#1a3a6b" 
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        {Platform.OS !== 'web' && menuOpen && (
          <View style={styles.mobileNav}>
            <TouchableOpacity style={styles.mobileNavItem} onPress={() => scrollToSection('inicio')}>
              <Text style={styles.mobileNavText}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileNavItem} onPress={() => scrollToSection('catalogo')}>
              <Text style={styles.mobileNavText}>Nuestros Equipos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileNavItem} onPress={() => scrollToSection('como-funciona')}>
              <Text style={styles.mobileNavText}>Cómo Funciona</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mobileNavItem, styles.mobileLoginButton]} 
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={['#1a3a6b', '#2a5698']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Renta de Equipo Tecnológico Sin Complicaciones</Text>
          <Text style={styles.heroSubtitle}>
            Accede a nuestra plataforma y gestiona tus préstamos de equipo de forma rápida y segura.
          </Text>
          <TouchableOpacity style={styles.heroCTA} onPress={handleLogin}>
            <Text style={styles.heroCTAText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explora Nuestro Catálogo</Text>
        <View style={styles.categoriesGrid}>
          <CategoryItem icon="laptop-outline" title="Laptops" />
          <CategoryItem icon="videocam-outline" title="Proyectores" />
          <CategoryItem icon="headset-outline" title="Audio y Video" />
          <CategoryItem icon="hardware-chip-outline" title="Soporte Técnico" />
        </View>
      </View>

      {/* How it Works Section */}
      <View style={[styles.section, styles.howItWorks]}>
        <Text style={styles.sectionTitle}>¿Cómo rentar con nosotros?</Text>
        <View style={styles.stepsContainer}>
          <StepItem
            number={1}
            title="Inicia Sesión"
            description="Accede a tu cuenta en nuestra plataforma."
          />
          <StepItem
            number={2}
            title="Selecciona tu Equipo"
            description="Navega por el catálogo y elige lo que necesitas."
          />
          <StepItem
            number={3}
            title="Gestiona tu Renta"
            description="Confirma tu préstamo y recoge tu equipo."
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>SG-PRESTAMOS</Text>
        <Text style={styles.copyright}>© 2025 SG-PRESTAMOS. Todos los derechos reservados.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Términos y Condiciones</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Política de Privacidad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 247, 246, 0.5)',
    position: Platform.OS === 'web' ? 'sticky' : 'relative',
    top: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'web' ? 60 : 45,
    paddingBottom: Platform.OS === 'web' ? 30 : 25,
    marginTop: Platform.OS === 'web' ? 30 : 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        '@media (max-height: 700px)': {
          paddingTop: 40,
          paddingBottom: 20,
          marginTop: 20,
        },
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: Platform.OS === 'web' ? '5%' : 16,
    height: Platform.OS === 'web' ? 80 : 60,
  },
  menuButton: {
    padding: 8,
  },
  logo: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: '800',
    color: '#1a3a6b',
    letterSpacing: -0.5,
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          fontSize: 24,
        },
      },
    }),
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 32 : 16,
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          gap: 16,
        },
      },
    }),
  },
  navItem: {
    color: '#1a3a6b',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          opacity: 1,
          transform: 'translateY(-1px)',
        },
      },
    }),
  },
  loginButton: {
    backgroundColor: '#1a3a6b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
          backgroundColor: '#234b8a',
          transform: 'translateY(-1px)',
        },
      },
    }),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mobileNav: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F7F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1001,
    ...Platform.select({
      web: {
        '@media (max-height: 600px)': {
          maxHeight: '60vh',
          overflow: 'auto',
        },
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mobileNavItem: {
    paddingVertical: 16,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F7F6',
  },
  mobileNavText: {
    fontSize: 16,
    color: '#1a3a6b',
    fontWeight: '500',
  },
  mobileLoginButton: {
    backgroundColor: '#1a3a6b',
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  heroSection: {
    minHeight: Platform.OS === 'web' ? 700 : 500,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 40 : 20,
    position: 'relative',
  },
  heroContent: {
    maxWidth: 1000,
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? '10%' : 20,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 56 : 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
    ...Platform.select({
      web: {
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.95,
    maxWidth: 600,
    lineHeight: Platform.OS === 'web' ? 36 : 27,
  },
  heroCTA: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          backgroundColor: '#F8FAFF',
        },
      },
    }),
  },
  heroCTAText: {
    color: '#1a3a6b',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    padding: 40,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 40,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  categoryItem: {
    width: Platform.OS === 'web' ? 250 : 200,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          backgroundColor: '#F8FAFF',
        },
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F4F7F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        ':hover': {
          backgroundColor: '#E8EFFF',
          transform: 'scale(1.05)',
        },
      },
    }),
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  howItWorks: {
    backgroundColor: '#F4F7F6',
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30,
  },
  stepItem: {
    width: Platform.OS === 'web' ? 300 : 250,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        },
      },
    }),
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a3a6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1a3a6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3a6b',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 40,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a6b',
    marginBottom: 16,
  },
  copyright: {
    color: '#666666',
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    color: '#1a3a6b',
  },
});

export default LandingPage;