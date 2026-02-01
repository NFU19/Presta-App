
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, DocumentData, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
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
  Image,
  DimensionValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { useResponsive } from '@/hooks/use-responsive';

// Define the structure of an Equipo
interface Equipo {
  id: string;
  nombre: string;
  categoria?: string;
  tipo?: string;
  estado?: boolean;
  imagen?: string;
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
        imagen: doc.data().imagen,
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

  const columns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (width < 1200) return 3;
    return 4;
  }, [isMobile, isTablet, width]);

  const cardWidth: DimensionValue = useMemo(() => `${100 / columns - 2}%` as DimensionValue, [columns]);

  const StatusDot = ({ active }: { active: boolean }) => (
    <View style={[styles.statusDot, active ? styles.statusDotOn : styles.statusDotOff]} />
  );

  const EquipoCard = ({ item }: { item: Equipo }) => (
    <View style={[styles.card, { width: isMobile ? '100%' : cardWidth }]}> 
      <View style={styles.cardImageWrapper}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image" size={28} color="#9aa4b5" />
            <Text style={styles.cardPlaceholderText}>Sin imagen</Text>
          </View>
        )}
        <View style={styles.cardStatus}>
          <StatusDot active={!!item.estado} />
          <Text style={styles.statusLabel}>{item.estado ? 'Disponible' : 'No disponible'}</Text>
        </View>
        <View style={styles.cardActionsHover}>
          <TouchableOpacity style={[styles.iconButton, styles.iconButtonPrimary]} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, styles.iconButtonDanger]} onPress={() => handleDelete(item)}>
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardCategory}>{item.categoria || 'Sin categoría'}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaChip}>
          <Ionicons name="hardware-chip-outline" size={14} color="#4b5563" style={{ marginRight: 6 }} />
          <Text style={styles.metaChipText}>{item.tipo || 'Tipo no especificado'}</Text>
        </View>
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
        <ActivityIndicator size="large" color="#0A66FF" style={styles.loader} />
      ) : (
        <View style={[styles.cardsContainer, { justifyContent: 'flex-start' }]}>
          {equipos.map((item) => (
            <EquipoCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
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
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: 0.2,
  },
  titleMobile: {
    fontSize: 20,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#0A66FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 14px 32px rgba(10,102,255,0.25)',
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
    fontWeight: '700',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 18px 42px rgba(10,37,64,0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 6,
      },
    }),
  },
  cardImageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f7fb',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cardPlaceholderText: {
    color: '#9aa4b5',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  cardStatus: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e6edf5',
  },
  statusLabel: { color: '#0A2540', fontWeight: '700', fontSize: 12 },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 6,
  },
  statusDotOn: { backgroundColor: '#22c55e' },
  statusDotOff: { backgroundColor: '#d1434b', shadowColor: '#d1434b' },
  cardActionsHover: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 10,
    opacity: 1,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 18px rgba(0,0,0,0.12)' },
    }),
  },
  iconButtonPrimary: { backgroundColor: '#0A66FF' },
  iconButtonDanger: { backgroundColor: '#d1434b' },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2540',
  },
  cardCategory: {
    fontSize: 14,
    color: '#6b7280',
    letterSpacing: 0.2,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e6edf5',
  },
  metaChipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
});

export default EquiposAdminScreen;
