
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { useResponsive } from '@/hooks/use-responsive';

// Define the structure of an Equipo
interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  tipo?: string;
  estado?: boolean;
}

const EquiposAdminScreen = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'equipos'), (snapshot) => {
      const equiposData: Equipo[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        nombre: doc.data().nombre || 'Nombre no disponible',
        categoria: doc.data().tipo || 'Sin categoría',
        tipo: doc.data().tipo,
        estado: doc.data().estado !== undefined ? doc.data().estado : true,
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

  // Card component for mobile view
  const EquipoCard = ({ item }: { item: Equipo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <View style={[styles.badge, { backgroundColor: item.estado ? '#4CAF50' : '#f44336' }]}>
          <Text style={styles.badgeText}>{item.estado ? 'Disponible' : 'No Disponible'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Categoría:</Text>
          <Text style={styles.cardValue}>{item.categoria}</Text>
        </View>
        {item.descripcion && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Descripción:</Text>
            <Text style={styles.cardValue}>{item.descripcion}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, (isMobile || isTablet) && styles.containerMobile]}>
      <View style={[styles.header, (isMobile || isTablet) && styles.headerMobile]}>
        <Text style={[styles.title, (isMobile || isTablet) && styles.titleMobile]}>Gestión de Equipos</Text>
        <TouchableOpacity style={[styles.addButton, (isMobile || isTablet) && styles.addButtonMobile]} onPress={handleAdd}>
          <Text style={[styles.addButtonText, (isMobile || isTablet) && styles.addButtonTextMobile]}>
            {isMobile ? '+' : 'Añadir Equipo'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <>
          {/* Mobile/Tablet view - Cards */}
          {(isMobile || isTablet) ? (
            <View style={styles.cardsContainer}>
              {equipos.map((item) => (
                <EquipoCard key={item.id} item={item} />
              ))}
            </View>
          ) : (
            /* Desktop view - Table */
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.tableCell, styles.headerText, { flex: 3, minWidth: 150 }]}>Nombre</Text>
                  <Text style={[styles.tableCell, styles.headerText, { flex: 2, minWidth: 120 }]}>Categoría</Text>
                  <Text style={[styles.tableCell, styles.headerText, { flex: 2, minWidth: 120 }]}>Disponibilidad</Text>
                  <Text style={[styles.tableCell, styles.headerText, { flex: 2, minWidth: 150 }]}>Acciones</Text>
                </View>

                {equipos.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 3, minWidth: 150 }]}>{item.nombre}</Text>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 120 }]}>{item.categoria}</Text>
                    <Text style={[styles.tableCell, { flex: 2, minWidth: 120 }]}>{item.estado ? 'Sí' : 'No'}</Text>
                    <View style={[styles.tableCell, { flex: 2, minWidth: 150, flexDirection: 'row' }]}>
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
            </ScrollView>
          )}
        </>
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
  containerMobile: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerMobile: {
    marginBottom: 16,
    gap: 12,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  titleMobile: {
    fontSize: 20,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
    }),
  },
  addButtonMobile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextMobile: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  // Card styles for mobile
  cardsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 80,
  },
  cardValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
  // Table styles for desktop
  tableScroll: {
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '100%',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A2540',
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 12,
    backgroundColor: '#fff',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 8,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  actionTextEdit: {
    color: '#007bff',
    marginRight: 15,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  actionTextDelete: {
    color: '#f44336',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default EquiposAdminScreen;
