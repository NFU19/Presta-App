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
    Modal,
    FlatList,
} from 'react-native';
import { KeyboardDismissWrapper } from '@/components/ui/keyboard-dismiss-wrapper';
import { db } from '../../../firebaseConfig';

const EquipoModalScreen = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagen, setImagen] = useState('');
  const [estado, setEstado] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Estados para los dropdowns
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showSubcategoriaModal, setShowSubcategoriaModal] = useState(false);
  const [subcategoriaList, setSubcategoriaList] = useState<string[]>([]);
  const [customSubcategoria, setCustomSubcategoria] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Configuración de grupos mutuamente excluyentes - Ya no es necesario
  // Se mantiene por compatibilidad pero no se usa

  // Función para verificar si una selección es válida - Ya no es necesario
  // Se mantiene por compatibilidad pero no se usa

  // Configuración de tipos y subcategorías
  const tiposEquipo = [
    { id: 'mouse', nombre: 'Mouse' },
    { id: 'teclado', nombre: 'Teclado' },
    { id: 'monitor', nombre: 'Monitor' },
    { id: 'laptop', nombre: 'Laptop' },
    { id: 'impresora', nombre: 'Impresora' },
    { id: 'proyector', nombre: 'Proyector' },
    { id: 'tablet', nombre: 'Tablet' },
  ];

  const subcategorias = {
    mouse: [
      { id: 'optico', nombre: 'Óptico' },
      { id: 'inalambrico', nombre: 'Inalámbrico' },
      { id: 'usb', nombre: 'USB' },
      { id: 'ergonomico', nombre: 'Ergonómico' },
      { id: 'otro', nombre: 'Otro' },
    ],
    teclado: [
      { id: 'estandar', nombre: 'Estándar' },
      { id: 'inalambrico', nombre: 'Inalámbrico' },
      { id: 'ergonomico', nombre: 'Ergonómico' },
      { id: 'multimedia', nombre: 'Multimedia' },
      { id: 'compacto', nombre: 'Compacto' },
      { id: 'otro', nombre: 'Otro' },
    ],
    monitor: [
      { id: '19_pulgadas', nombre: '19"' },
      { id: '21_pulgadas', nombre: '21"' },
      { id: '24_pulgadas', nombre: '24"' },
      { id: '27_pulgadas', nombre: '27"' },
      { id: 'tactil', nombre: 'Táctil' },
      { id: 'led', nombre: 'LED' },
      { id: 'otro', nombre: 'Otro' },
    ],
    laptop: [
      { id: 'basica', nombre: 'Básica' },
      { id: 'estudiante', nombre: 'Para Estudiantes' },
      { id: 'profesional', nombre: 'Profesional' },
      { id: 'diseno', nombre: 'Diseño/Ingeniería' },
      { id: 'ultrabook', nombre: 'Ultrabook' },
      { id: 'otro', nombre: 'Otro' },
    ],
    impresora: [
      { id: 'laser_mono', nombre: 'Láser Monocromática' },
      { id: 'laser_color', nombre: 'Láser Color' },
      { id: 'inyeccion', nombre: 'Inyección de Tinta' },
      { id: 'multifuncional', nombre: 'Multifuncional' },
      { id: 'gran_formato', nombre: 'Gran Formato' },
      { id: 'otro', nombre: 'Otro' },
    ],
    proyector: [
      { id: 'aula', nombre: 'Para Aula' },
      { id: 'auditorio', nombre: 'Para Auditorio' },
      { id: 'portatil', nombre: 'Portátil' },
      { id: 'corta_distancia', nombre: 'Corta Distancia' },
      { id: 'interactivo', nombre: 'Interactivo' },
      { id: 'otro', nombre: 'Otro' },
    ],
    tablet: [
      { id: 'educativa', nombre: 'Educativa' },
      { id: 'profesional', nombre: 'Profesional' },
      { id: 'diseno', nombre: 'Diseño' },
      { id: 'lectura', nombre: 'Lectura' },
      { id: 'otro', nombre: 'Otro' },
    ],
  };

  const getTipoNombre = (tipoId: string) => {
    return tiposEquipo.find(t => t.id === tipoId)?.nombre || tipoId;
  };

  const getSubcategoriaNombre = (subcategoriaId: string, tipo: string) => {
    return subcategorias[tipo as keyof typeof subcategorias]?.find(s => s.id === subcategoriaId)?.nombre || subcategoriaId;
  };

  // Función para agregar subcategoría a la lista
  const addSubcategoriaToList = (subcategoriaId: string) => {
    const nombre = subcategoriaId === 'otro' ? customSubcategoria.trim() : getSubcategoriaNombre(subcategoriaId, tipo);
    
    if (!nombre || subcategoriaList.includes(nombre)) {
      return; // No agregar si está vacío o ya existe
    }

    // Verificar conflictos según el tipo de equipo
    const conflictResult = checkForConflicts(tipo, nombre, subcategoriaList);
    if (conflictResult.conflict) {
      // En lugar de mostrar error, reemplazar la opción conflictiva
      const nuevaLista = subcategoriaList.filter(item => item !== conflictResult.conflictingItem);
      setSubcategoriaList([...nuevaLista, nombre]);
      
      // Mostrar un mensaje informativo opcional
      Alert.alert(
        'Opción reemplazada',
        `Se reemplazó "${conflictResult.conflictingItem}" por "${nombre}".`,
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    // Si no hay conflicto, agregar normalmente
    setSubcategoriaList([...subcategoriaList, nombre]);
  };

  // Función para verificar conflictos entre subcategorías
  const checkForConflicts = (tipoEquipo: string, nuevaSubcategoria: string, listaActual: string[]) => {
    const conflictos = {
      mouse: [
        ['Inalámbrico', 'USB'], // Conectividad
      ],
      teclado: [
        ['Estándar', 'Ergonómico', 'Compacto'], // Tipo de diseño
      ],
      monitor: [
        ['19"', '21"', '24"', '27"'], // Tamaño
      ],
      laptop: [
        ['Básica', 'Para Estudiantes', 'Profesional', 'Diseño/Ingeniería'], // Categoría
      ],
      impresora: [
        ['Láser Monocromática', 'Láser Color', 'Inyección de Tinta'], // Tecnología
      ],
      proyector: [
        ['Para Aula', 'Para Auditorio'], // Ubicación
        ['Portátil', 'Corta Distancia'], // Tipo de instalación
      ],
      tablet: [
        ['Educativa', 'Profesional', 'Diseño', 'Lectura'], // Propósito
      ],
    };

    const gruposConflictivos = conflictos[tipoEquipo as keyof typeof conflictos] || [];
    
    for (const grupo of gruposConflictivos) {
      if (grupo.includes(nuevaSubcategoria)) {
        const conflictoEncontrado = listaActual.find(item => 
          grupo.includes(item) && item !== nuevaSubcategoria
        );
        if (conflictoEncontrado) {
          return { conflict: true, conflictingItem: conflictoEncontrado };
        }
      }
    }
    
    return { conflict: false };
  };

  // Función para remover subcategoría de la lista
  const removeSubcategoriaFromList = (subcategoria: string) => {
    setSubcategoriaList(subcategoriaList.filter(s => s !== subcategoria));
  };

  // Función para verificar si una subcategoría es personalizada al cargar datos existentes
  const isCustomSubcategoria = (tipo: string, subcategoriaValue: string) => {
    const predefinedOptions = subcategorias[tipo as keyof typeof subcategorias] || [];
    return !predefinedOptions.some(option => option.id === subcategoriaValue);
  };

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
          
          // Manejar subcategorías al cargar (compatibilidad con formatos anteriores)
          if (data.subcategoria) {
            if (Array.isArray(data.subcategoria)) {
              // Formato array (más reciente)
              setSubcategoriaList(data.subcategoria);
            } else {
              // Formato string (más antiguo)
              setSubcategoriaList([data.subcategoria]);
            }
          } else {
            setSubcategoriaList([]);
          }
          
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
      subcategoria: subcategoriaList,
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

  const handleTipoSelect = (tipoSeleccionado: string) => {
    setTipo(tipoSeleccionado);
    setSubcategoriaList([]); // Reset subcategorías cuando cambia el tipo
    setCustomSubcategoria(''); // Reset subcategoría personalizada
    setShowCustomInput(false); // Ocultar input personalizado
    setShowTipoModal(false);
  };

  const handleSubcategoriaSelect = (subcategoriaSeleccionada: string) => {
    if (subcategoriaSeleccionada === 'otro') {
      setShowCustomInput(true);
      setCustomSubcategoria('');
    } else {
      addSubcategoriaToList(subcategoriaSeleccionada);
    }
    setShowSubcategoriaModal(false);
  };

  const handleAddCustomSubcategoria = () => {
    if (customSubcategoria.trim()) {
      addSubcategoriaToList('otro');
      setCustomSubcategoria('');
      setShowCustomInput(false);
    }
  };

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: { id: string; nombre: string }[],
    onSelect: (id: string) => void
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.multiSelectHint}>Selecciona una opción para agregar a la lista</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelect(item.id)}
              >
                <Text style={styles.modalItemText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardDismissWrapper disabled={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditMode ? 'Editar Equipo' : 'Añadir Equipo'}</Text>

      <Text style={styles.label}>Nombre del Equipo</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Tipo de Equipo</Text>
      <TouchableOpacity 
        style={[styles.input, styles.dropdown]}
        onPress={() => setShowTipoModal(true)}
      >
        <Text style={[styles.dropdownText, !tipo && styles.placeholder]}>
          {tipo ? getTipoNombre(tipo) : 'Selecciona el tipo de equipo'}
        </Text>
      </TouchableOpacity>

      {tipo && subcategorias[tipo as keyof typeof subcategorias] && (
        <>
          <Text style={styles.label}>Subcategorías</Text>
          
          {/* Lista de subcategorías agregadas */}
          {subcategoriaList.length > 0 && (
            <View style={styles.subcategoriasContainer}>
              <Text style={styles.subcategoriasLabel}>Subcategorías seleccionadas:</Text>
              <View style={styles.subcategoriasList}>
                {subcategoriaList.map((subcat, index) => (
                  <View key={index} style={styles.subcategoriaChip}>
                    <Text style={styles.subcategoriaChipText}>🏷️ {subcat}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeSubcategoriaFromList(subcat)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!showCustomInput ? (
            <TouchableOpacity 
              style={[styles.input, styles.dropdown]}
              onPress={() => setShowSubcategoriaModal(true)}
            >
              <Text style={[styles.dropdownText, styles.placeholder]}>
                + Agregar subcategoría
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customInputContainer}>
              <TextInput
                style={[styles.input, styles.customInput]}
                value={customSubcategoria}
                onChangeText={setCustomSubcategoria}
                placeholder="Escribe la subcategoría personalizada"
                autoFocus
                onSubmitEditing={handleAddCustomSubcategoria}
              />
              <View style={styles.customButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.changeOptionButton, styles.addButton]}
                  onPress={handleAddCustomSubcategoria}
                >
                  <Text style={[styles.changeOptionText, styles.addButtonText]}>✓ Agregar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.changeOptionButton}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomSubcategoria('');
                    setShowSubcategoriaModal(true);
                  }}
                >
                  <Text style={styles.changeOptionText}>📋 Seleccionar de lista</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

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

      {/* Modales para dropdowns */}
      {renderDropdownModal(
        showTipoModal,
        () => setShowTipoModal(false),
        'Selecciona el tipo de equipo',
        tiposEquipo,
        handleTipoSelect
      )}

      {tipo && subcategorias[tipo as keyof typeof subcategorias] && renderDropdownModal(
        showSubcategoriaModal,
        () => setShowSubcategoriaModal(false),
        'Selecciona la subcategoría',
        subcategorias[tipo as keyof typeof subcategorias],
        handleSubcategoriaSelect
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
  dropdown: {
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#0A2540',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customInputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  customInput: {
    marginBottom: 10,
    width: '100%',
  },
  changeOptionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  changeOptionText: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  multiSelectHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  modalItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  modalItemTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  modalItemDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  modalItemTextDisabled: {
    color: '#999',
    fontStyle: 'italic',
  },
  subcategoriasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
    paddingHorizontal: 5,
  },
  subcategoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
    marginBottom: 8,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subcategoriaChipText: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  customButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  addButtonText: {
    color: '#fff',
  },
  subcategoriasContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  subcategoriasLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default EquipoModalScreen;