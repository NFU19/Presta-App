
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, doc, deleteDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Define the structure of an Equipo
interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  disponible?: boolean;
}

const EquiposAdminScreen = () => {
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

  const handleEdit = (item: Equipo) => {
    router.push({ pathname: '/admin/equipos/modal', params: { id: item.id } });
  };

  const handleDelete = (item: Equipo) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'equipos', item.id));
              Alert.alert('Éxito', 'Equipo eliminado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el equipo.');
              console.error("Error deleting document: ", error);
            }
          },
        },
      ]
    );
  };

  const handleAdd = () => {
    router.push('/admin/equipos/modal');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Equipos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Añadir Equipo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCell, styles.headerText, { flex: 3 }]}>Nombre</Text>
            <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Categoría</Text>
            <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Disponibilidad</Text>
            <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Acciones</Text>
          </View>

          {equipos.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.nombre}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.categoria}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.disponible ? 'Sí' : 'No'}</Text>
              <View style={[styles.tableCell, { flex: 2, flexDirection: 'row' }]}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Text style={styles.actionTextEdit}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={styles.actionTextDelete}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderColor: '#dfe4ea',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#dfe4ea',
    alignItems: 'center',
  },
  tableCell: {
    padding: 12,
    fontSize: 14,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#0A2540',
  },
  actionTextEdit: {
    color: '#007bff',
    marginRight: 15,
  },
  actionTextDelete: {
    color: '#dc3545',
  },
});

export default EquiposAdminScreen;
