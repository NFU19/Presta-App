import { useVpsUser } from "@/contexts/VpsUserContext";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { auth } from "../../firebaseConfig";

const AdminLayout = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isMobile, isTablet } = useResponsive();
  const { clearVpsUserId } = useVpsUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // En móvil/tablet, el menú se oculta por defecto
  const showSidebar = !isMobile && !isTablet;

  const handleLogout = async () => {
    try {
      await clearVpsUserId();
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  const navigateTo = (
    path:
      | "/admin"
      | "/admin/equipos"
      | "/admin/prestamos"
      | "/admin/usuarios"
      | "/admin/historial",
  ) => {
    router.replace(path);
    if (isMobile || isTablet) {
      setIsMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Panel Admin</Text>
        {(isMobile || isTablet) && (
          <TouchableOpacity
            onPress={() => setIsMenuOpen(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.sidebarScroll}>
        <TouchableOpacity
          style={styles.sidebarLink}
          onPress={() => navigateTo("/admin")}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.sidebarLinkText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarLink}
          onPress={() => navigateTo("/admin/equipos")}
        >
          <Ionicons name="laptop" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.sidebarLinkText}>Gestión de Equipos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarLink}
          onPress={() => navigateTo("/admin/prestamos")}
        >
          <Ionicons name="cube" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.sidebarLinkText}>Gestión de Préstamos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarLink}
          onPress={() => navigateTo("/admin/usuarios")}
        >
          <Ionicons name="people" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.sidebarLinkText}>Gestión de Usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarLink}
          onPress={() => navigateTo("/admin/historial")}
        >
          <Ionicons name="time" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.sidebarLinkText}>Historial</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity
        style={[styles.sidebarLink, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.sidebarLinkText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Hamburger button for mobile/tablet */}
      {(isMobile || isTablet) && (
        <View style={styles.mobileHeaderSafeArea}>
          <View style={styles.mobileHeader}>
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              style={styles.hamburger}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={28} color="#0A2540" />
            </TouchableOpacity>
            <Text style={styles.mobileHeaderTitle}>
              Dashboard de Administrador
            </Text>
          </View>
        </View>
      )}

      {/* Sidebar - Fixed for desktop, Modal for mobile/tablet */}
      {showSidebar ? (
        <View style={styles.sidebar}>
          <SidebarContent />
        </View>
      ) : (
        <Modal
          visible={isMenuOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSidebar}>
              <SidebarContent />
            </View>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setIsMenuOpen(false)}
              activeOpacity={1}
            />
          </View>
        </Modal>
      )}

      {/* Content Area */}
      <View
        style={[
          styles.mainContent,
          (isMobile || isTablet) && styles.mainContentMobile,
        ]}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f0f4f8",
  },
  mobileHeaderSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 100,
    paddingTop: Platform.OS === "web" ? 0 : 0, // Sin padding extra en web
    ...Platform.select({
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  mobileHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  hamburger: {
    padding: 12,
    marginRight: 8,
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
        ":hover": {
          backgroundColor: "rgba(0,0,0,0.05)",
        },
      },
    }),
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2540",
    flex: 1,
  },
  sidebar: {
    width: 260,
    backgroundColor: "#0A2540",
    paddingVertical: 22,
    justifyContent: "space-between",
    borderRightWidth: Platform.OS === "web" ? 1 : 0,
    borderRightColor: "rgba(255,255,255,0.06)",
    ...Platform.select({
      web: {
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
      },
    }),
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  closeButton: {
    padding: 4,
  },
  sidebarScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sidebarLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.18s ease, transform 0.18s ease",
        ":hover": {
          backgroundColor: "rgba(255,255,255,0.08)",
          transform: "translateX(4px)",
        },
      },
    }),
  },
  icon: {
    marginRight: 12,
  },
  sidebarLinkText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  logoutButton: {
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(220, 53, 69, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(220, 53, 69, 0.35)",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f0f4f8",
  },
  mainContentMobile: {
    paddingTop: Platform.OS === "web" ? 60 : 100,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  modalSidebar: {
    width: 280,
    backgroundColor: "#0A2540",
    paddingVertical: 20,
    justifyContent: "space-between",
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default AdminLayout;
