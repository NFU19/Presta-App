
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    try {
      console.log('Paso 1: Intentando crear usuario en Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Paso 1 Exitoso: Usuario creado en Auth con UID:', user.uid);

      console.log('Paso 2: Intentando escribir en la base de datos Firestore...');
      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        role: 'user',
        createdAt: new Date(),
      });
      console.log('Paso 2 Exitoso: Documento creado en Firestore.');

      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      router.replace('/login');

    } catch (error: any) {
      console.error("Error detallado en el registro: ", error);
      Alert.alert('Error de Registro', `Ocurrió un error. Revisa la consola para más detalles. Mensaje: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../logo.png')} style={styles.logo} />
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Únete a SG-Prestamos</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.linkText}>¿Ya tienes una cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#525f7f',
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
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    marginTop: 20,
    fontSize: 16,
  },
});

export default RegisterScreen;
