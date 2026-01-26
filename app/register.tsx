
import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        role: 'user',
        createdAt: new Date(),
      });

      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      router.replace('/login');

    } catch (error: any) {
      console.error("Error en el registro: ", error);
      let errorMessage = 'Ocurrió un error durante el registro.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El email no es válido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil.';
      }
      Alert.alert('Error de Registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderBrandPanel = () => (
    <View style={styles.brandPanel}>
      <View style={styles.brandContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="person-add" size={60} color="#fff" />
        </View>
        <Text style={styles.brandTitle}>Únete a{'\n'}SG-PRÉSTAMOS</Text>
        <Text style={styles.brandSubtitle}>
          Crea tu cuenta y comienza a gestionar{'\n'}préstamos de equipos de forma eficiente
        </Text>
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <Text style={styles.featureText}>Seguro y confiable</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.featureText}>Rápido y fácil</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.featureText}>Acceso a todo el catálogo</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formPanel}>
      <KeyboardAvoidingView 
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isMobile && (
            <View style={styles.mobileHeader}>
              <Ionicons name="cube" size={50} color={Colors.light.primary} />
              <Text style={styles.mobileTitle}>SG-PRÉSTAMOS</Text>
            </View>
          )}

          <View style={styles.formHeader}>
            <Text style={styles.welcomeTitle}>Crear cuenta</Text>
            <Text style={styles.welcomeSubtitle}>Completa tus datos para registrarte</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'email' && styles.inputWrapperFocused
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={focusedInput === 'email' ? Colors.light.secondary : '#888'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'password' && styles.inputWrapperFocused
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={focusedInput === 'password' ? Colors.light.secondary : '#888'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'confirmPassword' && styles.inputWrapperFocused
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={focusedInput === 'confirmPassword' ? Colors.light.secondary : '#888'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  if (isWeb && !isMobile) {
    return (
      <View style={styles.container}>
        {renderBrandPanel()}
        {renderForm()}
      </View>
    );
  }

  return (
    <View style={styles.mobileContainer}>
      {renderForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  brandPanel: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    maxWidth: 500,
    zIndex: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -1,
    lineHeight: 50,
  },
  brandSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 28,
    marginBottom: 40,
  },
  featuresContainer: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  formPanel: {
    flex: 1,
    backgroundColor: '#fff',
    ...(isWeb && !isMobile ? {
      maxWidth: 600,
      minWidth: 500,
    } : {}),
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: isWeb && !isMobile ? 60 : 24,
    paddingTop: isMobile ? 40 : 60,
  },
  mobileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 12,
  },
  formHeader: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.textDark,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.light.gray,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputWrapperFocused: {
    backgroundColor: '#fff',
    borderColor: Colors.light.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textDark,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    padding: 8,
    position: 'absolute',
    right: 8,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.secondary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#888',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: Colors.light.gray,
  },
  loginLink: {
    color: Colors.light.secondary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
