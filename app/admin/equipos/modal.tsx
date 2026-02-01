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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.formWrapper}>
          <Text style={styles.title}>{isEditMode ? 'Editar Equipo' : 'Añadir Equipo'}</Text>

          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Text style={styles.label}>Nombre del Equipo</Text>
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Laptop Dell" />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Tipo de Equipo</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dropdown]}
                onPress={() => setShowTipoModal(true)}
              >
                <Text style={[styles.dropdownText, !tipo && styles.placeholder]}>
                  {tipo ? getTipoNombre(tipo) : 'Selecciona el tipo de equipo'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={[styles.formField, styles.formFieldFull]}>
              {tipo && subcategorias[tipo as keyof typeof subcategorias] && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Text style={styles.label}>Subcategorías</Text>
                    <TouchableOpacity style={styles.linkButton} onPress={() => setShowSubcategoriaModal(true)}>
                      <Ionicons name="add-circle-outline" size={18} color="#0A66FF" />
                      <Text style={styles.linkButtonText}>Agregar subcategoría</Text>
                    </TouchableOpacity>
                  </View>

                  {subcategoriaList.length > 0 && (
                    <View style={styles.subcategoriasList}>
                      {subcategoriaList.map((subcat, index) => (
                        <View key={index} style={styles.subcategoriaChip}>
                          <Ionicons name="pricetag-outline" size={14} color="#0A66FF" style={{ marginRight: 6 }} />
                          <Text style={styles.subcategoriaChipText}>{subcat}</Text>
                          <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => removeSubcategoriaFromList(subcat)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close" size={14} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {showCustomInput && (
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
                          <Text style={[styles.changeOptionText, styles.addButtonText]}>Agregar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.changeOptionButton}
                          onPress={() => {
                            setShowCustomInput(false);
                            setCustomSubcategoria('');
                            setShowSubcategoriaModal(true);
                          }}
                        >
                          <Text style={styles.changeOptionText}>Elegir de la lista</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {!showCustomInput && (
                    <TouchableOpacity 
                      style={[styles.input, styles.dropdown, styles.subcategoryCta]}
                      onPress={() => setShowSubcategoriaModal(true)}
                    >
                      <Text style={[styles.dropdownText, styles.placeholder]}>
                        + Agregar subcategoría
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>URL de la Imagen</Text>
              <TextInput style={styles.input} value={imagen} onChangeText={setImagen} placeholder="https://ejemplo.com/imagen.jpg" />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Disponible</Text>
              <View style={styles.switchControl}>
                <Text style={styles.switchLabel}>{estado ? 'Disponible' : 'No disponible'}</Text>
                <Switch value={estado} onValueChange={setEstado} />
              </View>
            </View>

            <View style={[styles.formField, styles.formFieldFull]}>
              <Text style={styles.label}>Previsualización</Text>
              <View style={styles.previewWrapper}>
                {imagen ? (
                  <Image source={{ uri: imagen }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="image" size={40} color="#9aa4b5" />
                    <Text style={styles.previewPlaceholderText}>Pega una URL para ver la imagen</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={() => router.back()}>
              <Text style={[styles.buttonText, styles.buttonGhostText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f5f7fb',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e6edf5',
    ...Platform.select({
      web: { boxShadow: '0 18px 48px rgba(10,37,64,0.12)' },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formField: {
    width: '48%',
    minWidth: 260,
    flexGrow: 1,
  },
  formFieldFull: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e4e9f2',
    ...Platform.select({
      web: { transition: 'border-color 0.15s ease, box-shadow 0.15s ease' },
    }),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#9aa4b5',
  },
  subsection: {
    backgroundColor: '#f7f9fc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6edf5',
    padding: 14,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkButtonText: {
    color: '#0A66FF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#e6edf5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#0A2540',
  },
  multiSelectHint: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
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
    backgroundColor: '#eef2f7',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dce3ed',
  },
  modalCloseText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '700',
  },
  customInputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  customInput: {
    marginTop: 10,
  },
  subcategoriasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  subcategoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A66FF',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  subcategoriaChipText: {
    color: '#0A66FF',
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    backgroundColor: '#d1434b',
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeOptionButton: {
    backgroundColor: '#f8f9fb',
    borderWidth: 1,
    borderColor: '#e4e9f2',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  changeOptionText: {
    color: '#0A66FF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  customButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#0A66FF',
    borderColor: '#0A66FF',
  },
  addButtonText: {
    color: '#fff',
  },
  subcategoryCta: { marginTop: 10 },
  switchControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e9f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#f9fafb',
  },
  switchLabel: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '700',
  },
  previewWrapper: {
    width: '100%',
    backgroundColor: '#f7f9fc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6edf5',
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 260,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  previewPlaceholderText: {
    color: '#6b7280',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  buttonPrimary: {
    backgroundColor: '#0A66FF',
    ...Platform.select({
      web: { boxShadow: '0 12px 24px rgba(10,102,255,0.25)' },
    }),
  },
  buttonGhost: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e9f2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonGhostText: { color: '#4b5563' },
});

export default EquipoModalScreen;