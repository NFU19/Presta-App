// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  getReactNativePersistence, 
  initializeAuth 
} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM3mhRV9mUL-MY8R_W9fHr_f75PE-5SmY",
  authDomain: "prestaequipoapp.firebaseapp.com",
  projectId: "prestaequipoapp",
  storageBucket: "prestaequipoapp.firebasestorage.app",
  messagingSenderId: "807656499630",
  appId: "1:807656499630:web:0571d14c92c3413b7c403f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication with persistence for React Native
export const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
