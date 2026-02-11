
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// This component will be the main dashboard for the web admin panel.

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const AdminDashboard = () => {
  // Mock function para descargar reporte (RF-8)
  const handleDownloadReport = () => {
    Alert.alert(
      'Descargar Reporte',
      '¿En qué formato deseas descargar el reporte?',
      [
        {
          text: 'PDF',
          onPress: () => Alert.alert('Descargando...', 'Reporte en formato PDF generado correctamente')
        },
        {
          text: 'CSV',
          onPress: () => Alert.alert('Descargando...', 'Reporte en formato CSV generado correctamente')
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con título y botón de descarga */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard de Administrador</Text>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownloadReport}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Descargar Reporte (PDF/CSV)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <StatCard title="Préstamos Activos" value="12" icon="🔄" />
        <StatCard title="Equipos Disponibles" value="58" icon="✅" />
        <StatCard title="Total de Usuarios" value="134" icon="👥" />
        <StatCard title="Préstamos Hoy" value="8" icon="🗓️" />
      </View>
      {/* Later, we will add more sections like recent activity and charts */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Más reportes y gráficos aparecerán aquí.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540',
    fontFamily: 'Inter, sans-serif',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3a6b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '48%', // Two cards per row
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: '#525f7f',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  placeholder: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
});

export default AdminDashboard;
