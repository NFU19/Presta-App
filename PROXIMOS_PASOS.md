# 🎯 GUÍA RÁPIDA: Próximos Pasos para Completar SG-PRESTAMOS

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ **PASO 1: ESCANEO DE CÓDIGOS QR** (1-2 días)

#### **A. Instalar dependencias:**
```bash
npx expo install expo-barcode-scanner
npx expo install expo-camera
```

#### **B. Solicitar permisos en app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Permitir $(PRODUCT_NAME) acceder a la cámara para escanear códigos QR."
        }
      ]
    ]
  }
}
```

#### **C. Crear archivo: app/admin/scan-qr.tsx**
```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { registrarEntregaEquipo, registrarDevolucionEquipo } from '../../services/prestamoService';

export default function ScanQRScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<'entrega' | 'devolucion'>('entrega');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      if (mode === 'entrega') {
        const prestamo = await registrarEntregaEquipo(data);
        Alert.alert(
          '✅ Entrega Registrada',
          `Equipo: ${prestamo.equipoNombre}\nUsuario: ${prestamo.usuarioNombre}\nDevolver antes de: ${prestamo.fechaDevolucion?.toLocaleDateString()}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      } else {
        await registrarDevolucionEquipo(data);
        Alert.alert(
          '✅ Devolución Registrada',
          'El equipo ha sido devuelto correctamente y está nuevamente disponible.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message, [
        { text: 'Intentar de nuevo', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se otorgó permiso para usar la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={mode === 'entrega' ? 'Modo: Entrega' : 'Modo: Devolución'}
          onPress={() => setMode(mode === 'entrega' ? 'devolucion' : 'entrega')}
        />
      </View>
      
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instructions}>
          {mode === 'entrega' 
            ? 'Escanea el QR para ENTREGAR el equipo' 
            : 'Escanea el QR para REGISTRAR DEVOLUCIÓN'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', top: 40, zIndex: 10, width: '100%', padding: 20 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
  },
  instructions: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
});
```

#### **D. Agregar al menú admin (_layout.tsx):**
```typescript
<TouchableOpacity style={styles.sidebarLink} onPress={() => router.replace('/admin/scan-qr')}>
  <Text style={styles.sidebarLinkText}>📷 Escanear QR</Text>
</TouchableOpacity>
```

---

### ✅ **PASO 2: GESTIÓN DE USUARIOS** (2-3 días)

#### **A. Crear archivo: types/usuario.ts**
```typescript
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  matricula?: string;
  carrera?: string;
  telefono?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

#### **B. Crear archivo: services/usuarioService.ts**
```typescript
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Usuario } from '../types/usuario';

export const crearUsuario = async (usuario: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'usuarios'), {
    ...usuario,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const snapshot = await getDocs(collection(db, 'usuarios'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
};

export const actualizarUsuario = async (id: string, data: Partial<Usuario>) => {
  await updateDoc(doc(db, 'usuarios', id), {
    ...data,
    updatedAt: new Date(),
  });
};

export const eliminarUsuario = async (id: string) => {
  await deleteDoc(doc(db, 'usuarios', id));
};
```

#### **C. Crear archivo: app/admin/usuarios.tsx**
Similar a `equipos.tsx` pero con campos de usuario.

---

### ✅ **PASO 3: DASHBOARD CON GRÁFICOS** (2-3 días)

#### **A. Instalar librería:**
```bash
npm install victory-native
```

#### **B. Actualizar app/admin/index.tsx:**
```typescript
import { VictoryBar, VictoryChart, VictoryTheme, VictoryLine, VictoryPie } from 'victory-native';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    prestamosActivos: 0,
    equiposDisponibles: 0,
    totalUsuarios: 0,
    prestamosVencidos: 0,
  });
  
  const [equiposMasUsados, setEquiposMasUsados] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Préstamos activos
    const prestamosSnapshot = await getDocs(
      query(collection(db, 'prestamos'), where('estado', '==', 'activo'))
    );
    
    // Equipos disponibles
    const equiposSnapshot = await getDocs(
      query(collection(db, 'equipos'), where('estado', '==', true))
    );
    
    // Usuarios
    const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
    
    // Préstamos vencidos
    const vencidosSnapshot = await getDocs(
      query(collection(db, 'prestamos'), where('estado', '==', 'vencido'))
    );

    setStats({
      prestamosActivos: prestamosSnapshot.size,
      equiposDisponibles: equiposSnapshot.size,
      totalUsuarios: usuariosSnapshot.size,
      prestamosVencidos: vencidosSnapshot.size,
    });

    // Top 5 equipos más usados
    const prestamosData = await getDocs(collection(db, 'prestamos'));
    const equipoCounts: Record<string, number> = {};
    
    prestamosData.forEach(doc => {
      const equipoNombre = doc.data().equipoNombre;
      equipoCounts[equipoNombre] = (equipoCounts[equipoNombre] || 0) + 1;
    });

    const topEquipos = Object.entries(equipoCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ x: nombre, y: cantidad }));

    setEquiposMasUsados(topEquipos);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard de Administrador</Text>
      
      {/* Stats Cards */}
      <View style={styles.cardsContainer}>
        <StatCard title="Préstamos Activos" value={stats.prestamosActivos.toString()} icon="🔄" />
        <StatCard title="Equipos Disponibles" value={stats.equiposDisponibles.toString()} icon="✅" />
        <StatCard title="Total de Usuarios" value={stats.totalUsuarios.toString()} icon="👥" />
        <StatCard title="Préstamos Vencidos" value={stats.prestamosVencidos.toString()} icon="⚠️" />
      </View>

      {/* Gráfico de equipos más usados */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Equipos Más Solicitados</Text>
        <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
          <VictoryBar
            data={equiposMasUsados}
            style={{ data: { fill: '#007bff' } }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
}
```

---

### ✅ **PASO 4: NOTIFICACIONES** (1-2 días)

#### **A. Instalar Expo Notifications:**
```bash
npx expo install expo-notifications
```

#### **B. Configurar en app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

#### **C. Crear archivo: services/notificationService.ts**
```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // Inmediatamente
  });
};
```

#### **D. Integrar en aprobarSolicitudPrestamo:**
```typescript
import { sendLocalNotification } from './notificationService';

export const aprobarSolicitudPrestamo = async (...) => {
  // ... código existente ...
  
  // Enviar notificación
  await sendLocalNotification(
    '✅ Préstamo Aprobado',
    `Tu solicitud para ${equipoNombre} ha sido aprobada. Recoge tu equipo con el código QR.`
  );
};
```

---

### ✅ **PASO 5: RECUPERACIÓN DE CONTRASEÑA** (1 día)

#### **Actualizar app/login.tsx:**
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

const handleForgotPassword = async () => {
  if (!email) {
    Alert.alert('Error', 'Ingresa tu email para recuperar tu contraseña');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    Alert.alert(
      'Email Enviado',
      'Revisa tu correo para restablecer tu contraseña'
    );
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

// En el JSX:
<TouchableOpacity onPress={handleForgotPassword}>
  <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
</TouchableOpacity>
```

---

## 🔥 **ORDEN RECOMENDADO DE IMPLEMENTACIÓN**

1. **HOY:** Escaneo de QR (más crítico)
2. **Mañana:** Gestión de usuarios
3. **Día 3:** Dashboard con gráficos
4. **Día 4:** Notificaciones
5. **Día 5:** Recuperación de contraseña + Testing

---

## 📝 **COMANDOS ÚTILES**

```bash
# Instalar todas las dependencias recomendadas
npx expo install expo-barcode-scanner expo-camera expo-notifications victory-native

# Limpiar caché si hay problemas
npm start -- --clear

# Construir para producción
eas build --platform android
eas build --platform ios
```

---

## 🚀 **CUANDO TERMINES TODO**

### **Checklist Final:**
- [ ] Todos los requerimientos funcionales implementados
- [ ] Testing completo de flujos
- [ ] Reglas de seguridad de Firebase configuradas
- [ ] Variables de entorno protegidas
- [ ] Documentación actualizada
- [ ] Screenshots de la app
- [ ] Video demo del sistema
- [ ] Presentación final

---

**¡Éxito con tu proyecto!** 🎉
