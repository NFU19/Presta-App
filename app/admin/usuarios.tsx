import { collection, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';
import { useResponsive } from '@/hooks/use-responsive';
import { Usuario } from '@/types/usuario';
import { 
  registrarUsuario, 
  actualizarUsuario, 
  desactivarUsuario, 
  activarUsuario, 
  eliminarUsuario 
} from '@/services/usuarioService';

const UsuariosAdminScreen = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [rol, setRol] = useState<'Estudiante' | 'Docente' | 'Administrador'>('Estudiante'); // RF-1
  const [showRolModal, setShowRolModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = () => {
    fetch('http://217.182.64.251:8002/usuarios')
      .then(response => response.json())
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(error => {
        Alert.alert('Error', 'No se pudieron cargar los usuarios.');
        console.error("Error fetching users: ", error);
        setLoading(false);
      });
  };

  const handleAdd = () => {
    setEditingUser(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setNombre(user.nombre);
    setApellido(user.apellido);
    setTelefono(user.telefono);
    setCorreo(user.correo);
    setMatricula(user.matricula);
    setRol(user.rol || 'Estudiante'); // RF-1
    setModalVisible(true);
  };

  const handleToggleActive = async (user: Usuario) => {
    try {
      if (user.activo) {
        await desactivarUsuario(user.id);
        Alert.alert('Éxito', 'Usuario desactivado correctamente.');
      } else {
        await activarUsuario(user.id);
        Alert.alert('Éxito', 'Usuario activado correctamente.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del usuario.');
      console.error("Error toggling user status: ", error);
    }
  };

  const handleDelete = (user: Usuario) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar a "${user.nombre} ${user.apellido}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarUsuario(user.id);
              Alert.alert('Éxito', 'Usuario eliminado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
              console.error("Error deleting user: ", error);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setCorreo('');
    setMatricula('');
    setRol('Estudiante'); // RF-1
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return;
    }
    if (!correo.trim()) {
      Alert.alert('Error', 'El correo es requerido');
      return;
    }
    if (!matricula.trim()) {
      Alert.alert('Error', 'La matrícula es requerida');
      return;
    }
    if (!rol) {
      Alert.alert('Error', 'El rol es requerido');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert('Error', 'El correo no tiene un formato válido');
      return;
    }

    setSubmitting(true);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        await actualizarUsuario(editingUser.id, {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim(),
          correo: correo.trim(),
          matricula: matricula.trim(),
          rol, // RF-1
        });
        Alert.alert('Éxito', 'Usuario actualizado correctamente.');
      } else {
        // Crear nuevo usuario
        await registrarUsuario({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim(),
          correo: correo.trim(),
          matricula: matricula.trim(),
          rol, // RF-1
        });
        Alert.alert('Éxito', 'Usuario registrado correctamente.');
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar el usuario';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm.trim()) return usuarios;
    
    const term = searchTerm.toLowerCase();
    return usuarios.filter(user => 
      user.nombre.toLowerCase().includes(term) ||
      user.apellido.toLowerCase().includes(term) ||
      user.correo.toLowerCase().includes(term) ||
      user.matricula.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const StatusBadge = ({ active }: { active: boolean }) => (
    <View style={[styles.statusBadge, active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
      <Text style={[styles.statusBadgeText, active ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive]}>
        {active ? 'Activo' : 'Inactivo'}
      </Text>
    </View>
  );

  const UserCard = ({ user }: { user: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user.email.charAt(0)}
          </Text>
        </View>
        <View style={styles.userCardInfo}>
          <Text style={styles.userCardName}>{user.nombre} {user.apellido}</Text>
          <Text style={styles.userCardEmail}>{user.correo}</Text>
        </View>
        <StatusBadge active={user.activo} />
      </View>
      
      <View style={styles.userCardBody}>
        <View style={styles.userCardRow}>
          <Ionicons name="call-outline" size={16} color="#6b7280" />
          <Text style={styles.userCardLabel}>Teléfono:</Text>
          <Text style={styles.userCardValue}>{user.telefono}</Text>
        </View>
        <View style={styles.userCardRow}>
          <Ionicons name="school-outline" size={16} color="#6b7280" />
          <Text style={styles.userCardLabel}>Matrícula:</Text>
          <Text style={styles.userCardValue}>{user.matricula}</Text>
        </View>
        <View style={styles.userCardRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6b7280" />
          <Text style={styles.userCardLabel}>Rol:</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolBadgeText}>{user.rol || 'Sin asignar'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userCardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonEdit]} 
          onPress={() => handleEdit(user)}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, user.activo ? styles.actionButtonWarning : styles.actionButtonSuccess]} 
          onPress={() => handleToggleActive(user)}
        >
          <Ionicons name={user.activo ? "ban" : "checkmark-circle"} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{user.activo ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonDanger]} 
          onPress={() => handleDelete(user)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, (isMobile || isTablet) && styles.containerMobile]}>
      <View style={[styles.header, (isMobile || isTablet) && styles.headerMobile]}>
        <Text style={[styles.title, (isMobile || isTablet) && styles.titleMobile]}>Gestión de Usuarios</Text>
        <TouchableOpacity 
          style={[styles.addButton, (isMobile || isTablet) && styles.addButtonMobile]} 
          onPress={handleAdd}
        >
          <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>
            {isMobile ? 'Nuevo' : 'Registrar Usuario'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, (isMobile || isTablet) && styles.searchContainerMobile]}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, apellido, correo o matrícula..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0A66FF" style={styles.loader} />
      ) : (
        <View style={styles.usersContainer}>
          {filteredUsuarios.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </Text>
            </View>
          ) : (
            filteredUsuarios.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </View>
      )}

      {/* Modal de Registro/Edición */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, (isMobile || isTablet) && styles.modalContentMobile]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ingrese el nombre"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={apellido}
                  onChangeText={setApellido}
                  placeholder="Ingrese el apellido"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Ingrese el teléfono"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <TextInput
                  style={styles.input}
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="Ingrese el correo"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Matrícula *</Text>
                <TextInput
                  style={styles.input}
                  value={matricula}
                  onChangeText={setMatricula}
                  placeholder="Ingrese la matrícula"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rol *</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.dropdown]}
                  onPress={() => setShowRolModal(true)}
                >
                  <Text style={[styles.dropdownText, !rol && styles.dropdownPlaceholder]}>
                    {rol || 'Selecciona el rol'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]} 
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSubmit]} 
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      {editingUser ? 'Actualizar' : 'Registrar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para selección de rol (RF-1) */}
      <Modal
        visible={showRolModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRolModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rolModalContent}>
            <Text style={styles.rolModalTitle}>Selecciona el Rol</Text>
            
            <TouchableOpacity 
              style={[styles.rolOption, rol === 'Estudiante' && styles.rolOptionSelected]}
              onPress={() => {
                setRol('Estudiante');
                setShowRolModal(false);
              }}
            >
              <Ionicons 
                name="school" 
                size={24} 
                color={rol === 'Estudiante' ? '#0A66FF' : '#6b7280'} 
              />
              <Text style={[styles.rolOptionText, rol === 'Estudiante' && styles.rolOptionTextSelected]}>
                Estudiante
              </Text>
              {rol === 'Estudiante' && (
                <Ionicons name="checkmark-circle" size={24} color="#0A66FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.rolOption, rol === 'Docente' && styles.rolOptionSelected]}
              onPress={() => {
                setRol('Docente');
                setShowRolModal(false);
              }}
            >
              <Ionicons 
                name="person" 
                size={24} 
                color={rol === 'Docente' ? '#0A66FF' : '#6b7280'} 
              />
              <Text style={[styles.rolOptionText, rol === 'Docente' && styles.rolOptionTextSelected]}>
                Docente
              </Text>
              {rol === 'Docente' && (
                <Ionicons name="checkmark-circle" size={24} color="#0A66FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.rolOption, rol === 'Administrador' && styles.rolOptionSelected]}
              onPress={() => {
                setRol('Administrador');
                setShowRolModal(false);
              }}
            >
              <Ionicons 
                name="shield-checkmark" 
                size={24} 
                color={rol === 'Administrador' ? '#0A66FF' : '#6b7280'} 
              />
              <Text style={[styles.rolOptionText, rol === 'Administrador' && styles.rolOptionTextSelected]}>
                Administrador
              </Text>
              {rol === 'Administrador' && (
                <Ionicons name="checkmark-circle" size={24} color="#0A66FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rolModalCloseButton}
              onPress={() => setShowRolModal(false)}
            >
              <Text style={styles.rolModalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A66FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
          backgroundColor: '#0856d6',
          transform: 'translateY(-1px)',
        },
      },
    }),
  },
  addButtonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchContainerMobile: {
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  loader: {
    marginTop: 40,
  },
  usersContainer: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0A66FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  userCardEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeInactive: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: '#065f46',
  },
  statusBadgeTextInactive: {
    color: '#991b1b',
  },
  userCardBody: {
    gap: 12,
    marginBottom: 16,
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userCardLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  userCardValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  rolBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  rolBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  userCardActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionButtonEdit: {
    backgroundColor: '#0A66FF',
  },
  actionButtonWarning: {
    backgroundColor: '#f59e0b',
  },
  actionButtonSuccess: {
    backgroundColor: '#10b981',
  },
  actionButtonDanger: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalContentMobile: {
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1f2937',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  rolModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  rolModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  rolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  rolOptionSelected: {
    borderColor: '#0A66FF',
    backgroundColor: '#eff6ff',
  },
  rolOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  rolOptionTextSelected: {
    color: '#0A66FF',
  },
  rolModalCloseButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  rolModalCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonSubmit: {
    backgroundColor: '#0A66FF',
  },
  modalButtonTextCancel: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default UsuariosAdminScreen;
