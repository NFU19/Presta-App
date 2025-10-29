import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, DocumentData, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

// Define the structure of an Equipo
interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  disponible?: boolean;
  imagen?: string; // Corrected field name
}

const CatalogScreen = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'equipos'), (snapshot) => {
      const equiposData: Equipo[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        nombre: doc.data().nombre || 'Nombre no disponible',
        categoria: doc.data().categoria || 'Sin categoría',
        disponible: doc.data().disponible === true,
        imagen: doc.data().imagen, // Using the correct field name 'imagen'
      }));
      setEquipos(equiposData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching equipos: ", error);
      Alert.alert("Error", "No se pudieron cargar los equipos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleProductPress = (item: Equipo) => {
    router.push({
      pathname: '../product-details' as any,
      params: {
        id: item.id,
        nombre: item.nombre,
        categoria: item.categoria || 'Sin categoría',
        disponible: item.disponible?.toString() || 'false',
        imagen: item.imagen || 'https://via.placeholder.com/300',
      },
    });
  };

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item)}>
      <Image
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} // Placeholder if no image
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.cardCategory} numberOfLines={1}>{item.categoria}</Text>
        <View style={[styles.availability, { backgroundColor: item.disponible ? '#28a745' : '#dc3545' }]}>
          <Text style={styles.availabilityText}>{item.disponible ? 'Disponible' : 'No Disp.'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de Equipos</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={equipos}
          renderItem={renderEquipo}
          keyExtractor={(item) => item.id}
          numColumns={2} // Set the number of columns to 2
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  logoutText: {
    fontSize: 16,
    color: '#007bff',
  },
  list: {
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: '#525f7f',
    marginBottom: 8,
  },
  availability: {
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
});

export default CatalogScreen;
