

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';



const AdminLayout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View>
          {/* The title is now in the header, so this space is empty */}
          <TouchableOpacity style={styles.sidebarLink} onPress={() => router.replace('/admin')}>
            <Text style={styles.sidebarLinkText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarLink} onPress={() => router.replace('/admin/equipos')}>
            <Text style={styles.sidebarLinkText}>Gestión de Equipos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sidebarLink} onPress={handleLogout}>
          <Text style={styles.sidebarLinkText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.mainContent}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#0A2540', // Dark blue
    padding: 20,
    justifyContent: 'space-between',
  },
  sidebarLink: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  sidebarLinkText: {
    color: '#fff',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f0f4f8',
  },

});

export default AdminLayout;
