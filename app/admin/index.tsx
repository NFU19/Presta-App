
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// This component is the main dashboard for the web admin panel.

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const AdminDashboard = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard de Administrador</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 24,
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
  actionsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
