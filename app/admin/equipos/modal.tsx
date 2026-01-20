import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardDismissWrapper } from '@/components/ui/keyboard-dismiss-wrapper';
import { db } from '../../../firebaseConfig';

const EquipoModalScreen = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagen, setImagen] = useState('');
  const [estado, setEstado] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchEquipo = async () => {
        const docRef = doc(db, 'equipos', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre);
          setTipo(data.tipo);
          setEstado(data.estado !== undefined ? data.estado : true);
          setImagen(data.imagen || '');
        }
      };
      fetchEquipo();
    }
  }, [id]);

  const handleSave = async () => {
    if (!nombre || !tipo) {
      Alert.alert('Error', 'Por favor, completa los campos nombre y tipo.');
      return;
    }

    const equipoData = {
      nombre,
      tipo,
      estado,
      imagen,
    };

    try {
      if (isEditMode) {
        const docRef = doc(db, 'equipos', id as string);
        await updateDoc(docRef, equipoData);
        Alert.alert('Éxito', 'Equipo actualizado correctamente.');
      } else {
        await addDoc(collection(db, 'equipos'), equipoData);
        Alert.alert('Éxito', 'Equipo añadido correctamente.');
      }
      router.back();
    } catch (error) {
      console.error("Error saving document: ", error);
      Alert.alert('Error', 'No se pudo guardar el equipo.');
    }
  };

  return (
    <KeyboardDismissWrapper disabled={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditMode ? 'Editar Equipo' : 'Añadir Equipo'}</Text>

      <Text style={styles.label}>Nombre del Equipo</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Tipo de Equipo</Text>
      <TextInput 
        style={styles.input} 
        value={tipo} 
        onChangeText={setTipo}
        placeholder="Ej: Mouse, Teclado, Monitor, etc."
      />

      <Text style={styles.label}>URL de la Imagen</Text>
      <TextInput style={styles.input} value={imagen} onChangeText={setImagen} placeholder="https://ejemplo.com/imagen.jpg" />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Disponible</Text>
        <Switch value={estado} onValueChange={setEstado} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>

      {Platform.OS === 'web' && (
         <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
    </KeyboardDismissWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2540',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#525f7f',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonCancel: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EquipoModalScreen;