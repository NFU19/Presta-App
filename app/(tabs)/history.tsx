
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HistoryScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Préstamos</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Aquí se mostrará el historial de tus préstamos y reservas activas.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2540',
    fontFamily: 'Inter, sans-serif',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#525f7f',
    textAlign: 'center',
    fontFamily: 'Inter, sans-serif',
  },
});

export default HistoryScreen;
