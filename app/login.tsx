
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu email y contraseña.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the main app screen after successful login
      router.replace('/handle-redirect');
    } catch (error: any) {
      console.error("Login Error: ", error);
      Alert.alert('Error de Inicio de Sesión', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../logo.png')} style={styles.logo} />
      <Text style={styles.title}>SG-Prestamos</Text>
      <Text style={styles.subtitle}>Bienvenido de nuevo</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light blue-gray background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540', // Dark blue
    fontFamily: 'Inter, sans-serif',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#525f7f', // Medium blue-gray
    marginBottom: 30,
    fontFamily: 'Inter, sans-serif',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff', // Vibrant blue
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serif',
  },
  linkText: {
    color: '#007bff',
    marginTop: 20,
    fontSize: 16,
  },
});

export default LoginScreen;
