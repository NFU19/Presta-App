# 🏗️ ARQUITECTURA DEL SISTEMA SG-PRESTAMOS

## 📐 DIAGRAMA DE ARQUITECTURA

```
┌──────────────────────────────────────────────────────────────────────┐
│                        APLICACIÓN MÓVIL (React Native + Expo)         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │   USUARIO FINAL     │  │   ADMINISTRADOR     │                   │
│  │     (Alumno)        │  │      (Web)          │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│           │                         │                                 │
│           ▼                         ▼                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │  PANTALLAS USUARIO  │  │  PANTALLAS ADMIN    │                   │
│  ├─────────────────────┤  ├─────────────────────┤                   │
│  │ - Dashboard         │  │ - Dashboard         │                   │
│  │ - Historial         │  │ - Gestión Equipos   │                   │
│  │ - Favoritos         │  │ - Gestión Préstamos │                   │
│  │ - Perfil            │  │ - Gestión Usuarios  │                   │
│  │ - Solicitud Préstamo│  │ - Escaneo QR        │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│           │                         │                                 │
│           └────────────┬────────────┘                                │
│                        ▼                                              │
│  ┌──────────────────────────────────────────────┐                   │
│  │           CAPA DE SERVICIOS                   │                   │
│  ├──────────────────────────────────────────────┤                   │
│  │ - prestamoService.ts                          │                   │
│  │ - usuarioService.ts (futuro)                  │                   │
│  │ - equipoService.ts (futuro)                   │                   │
│  │ - notificationService.ts (futuro)             │                   │
│  └──────────────────────────────────────────────┘                   │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────────────────────────────┐                   │
│  │           FIREBASE SDK                        │                   │
│  ├──────────────────────────────────────────────┤                   │
│  │ - Firebase Auth                               │                   │
│  │ - Cloud Firestore                             │                   │
│  │ - (Futuro) Cloud Functions                    │                   │
│  │ - (Futuro) Cloud Storage                      │                   │
│  └──────────────────────────────────────────────┘                   │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌────────────────────────────────────────┐
        │         FIREBASE BACKEND                │
        ├────────────────────────────────────────┤
        │  Colecciones Firestore:                │
        │  ├─ usuarios/                          │
        │  ├─ equipos/                           │
        │  ├─ prestamos/                         │
        │  ├─ favoritos/ (futuro)                │
        │  └─ historial/ (futuro)                │
        └────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS: SOLICITUD DE PRÉSTAMO

```
┌────────────┐
│  USUARIO   │
│  (Móvil)   │
└─────┬──────┘
      │
      │ 1. Solicita préstamo
      ▼
┌─────────────────────────────────────┐
│ loan-request-modal.tsx               │
│ ┌─────────────────────────────────┐ │
│ │ - Valida inputs                 │ │
│ │ - Obtiene user.uid de Firebase  │ │
│ │ - Prepara datos de solicitud    │ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 2. Llama a servicio
      ▼
┌─────────────────────────────────────┐
│ prestamoService.ts                   │
│ crearSolicitudPrestamo()             │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Verifica disponibilidad equipo│ │
│ │ ✓ Valida límite 3 préstamos     │ │
│ │ ✓ Crea documento en Firestore   │ │
│ │ ✓ Actualiza estado equipo       │ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 3. Escribe en BD
      ▼
┌─────────────────────────────────────┐
│ FIRESTORE                            │
│ ┌─────────────────────────────────┐ │
│ │ prestamos/{id}                  │ │
│ │ ├─ usuarioId                    │ │
│ │ ├─ equipoId                     │ │
│ │ ├─ estado: "pendiente"          │ │
│ │ ├─ duracionDias                 │ │
│ │ └─ proposito                    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ equipos/{equipoId}              │ │
│ │ └─ estado: false (no disponible)│ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 4. Notificación en tiempo real
      ▼
┌────────────┐
│   ADMIN    │
│   (Web)    │
└─────┬──────┘
      │
      │ 5. Ve solicitud pendiente
      ▼
┌─────────────────────────────────────┐
│ app/admin/prestamos.tsx              │
│ ┌─────────────────────────────────┐ │
│ │ onSnapshot() → Escucha cambios  │ │
│ │ Muestra lista de solicitudes    │ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 6. Aprueba/Rechaza
      ▼
┌─────────────────────────────────────┐
│ prestamoService.ts                   │
│ aprobarSolicitudPrestamo() o         │
│ rechazarSolicitudPrestamo()          │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Genera código QR único        │ │
│ │ ✓ Actualiza estado              │ │
│ │ ✓ (Futuro) Envía notificación   │ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 7. Actualiza BD
      ▼
┌─────────────────────────────────────┐
│ FIRESTORE                            │
│ ┌─────────────────────────────────┐ │
│ │ prestamos/{id}                  │ │
│ │ ├─ estado: "aprobado"           │ │
│ │ ├─ codigoQR: "PRESTAMO-XXX..."  │ │
│ │ └─ fechaAprobacion              │ │
│ └─────────────────────────────────┘ │
└─────┬───────────────────────────────┘
      │
      │ 8. Usuario ve actualización
      ▼
┌────────────┐
│  USUARIO   │
│ (Historial)│
└────────────┘
```

---

## 📊 MODELO DE DATOS (FIRESTORE)

### **Colección: usuarios**
```typescript
{
  id: string (auto-generado),
  nombre: string,
  email: string,
  matricula?: string,
  carrera?: string,
  telefono?: string,
  role: "admin" | "user",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Colección: equipos**
```typescript
{
  id: string (auto-generado),
  nombre: string,
  tipo: string,
  subcategorias: string[],
  estado: boolean,  // true = disponible, false = no disponible
  imagen?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Colección: prestamos**
```typescript
{
  id: string (auto-generado),
  usuarioId: string,
  usuarioNombre: string,
  usuarioEmail: string,
  equipoId: string,
  equipoNombre: string,
  equipoImagen?: string,
  
  // Fechas
  fechaSolicitud: timestamp,
  fechaAprobacion?: timestamp,
  fechaPrestamo?: timestamp,
  fechaDevolucion?: timestamp,
  fechaDevolucionReal?: timestamp,
  
  // Detalles
  duracionDias: number,
  proposito: string,
  
  // Estados
  estado: "pendiente" | "aprobado" | "activo" | "devuelto" | "vencido" | "rechazado",
  
  // QR
  codigoQR?: string,  // Formato: "PRESTAMO-{ID}-{RANDOM}-{TIMESTAMP}"
  
  // Admin
  aprobadoPor?: string,
  notas?: string,
  motivoRechazo?: string,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔐 REGLAS DE SEGURIDAD (FIRESTORE)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function
    function isAdmin() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Usuarios
    match /usuarios/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Equipos
    match /equipos/{equipoId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Préstamos
    match /prestamos/{prestamoId} {
      // Usuarios pueden crear sus propias solicitudes
      allow create: if request.auth != null && 
                       request.resource.data.usuarioId == request.auth.uid;
      
      // Usuarios pueden leer sus propios préstamos, admins pueden leer todos
      allow read: if request.auth.uid == resource.data.usuarioId || isAdmin();
      
      // Solo admins pueden actualizar/eliminar
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🧩 COMPONENTES CLAVE

### **Componentes UI Reutilizables:**
```
components/
├── shared/
│   ├── product-card.tsx          → Tarjeta de equipo
│   ├── favorite-product-card.tsx → Tarjeta de favorito
│   ├── grid-product-card.tsx     → Tarjeta en grid
│   ├── side-menu.tsx             → Menú lateral animado
│   └── hamburger-menu.tsx        → Botón de menú
├── ui/
│   ├── keyboard-dismiss-wrapper.tsx → Dismiss teclado
│   └── navigation-friendly-wrapper.tsx
└── header.tsx                     → Header reutilizable
```

### **Servicios (Capa de lógica de negocio):**
```
services/
├── prestamoService.ts    ✅ Implementado
├── usuarioService.ts     ⏳ Futuro
├── equipoService.ts      ⏳ Futuro
└── notificationService.ts ⏳ Futuro
```

### **Tipos TypeScript:**
```
types/
├── prestamo.ts           ✅ Implementado
├── navigation.ts         ✅ Existente
├── router.ts             ✅ Existente
└── usuario.ts            ⏳ Futuro
```

---

## 🎯 PATRONES DE DISEÑO UTILIZADOS

### **1. Service Layer Pattern**
Separación de lógica de negocio de componentes UI.
```typescript
// ✅ BIEN: Servicio independiente
export const crearSolicitudPrestamo = async (...) => {
  // Validaciones
  // Lógica de negocio
  // Interacción con Firebase
};

// ❌ MAL: Todo en el componente
const handleSubmit = async () => {
  // Validaciones aquí
  // Firebase aquí
  // Lógica aquí
};
```

### **2. Repository Pattern (Implícito)**
Servicios actúan como repositorios para Firestore.

### **3. Singleton Pattern**
Firebase Auth y Firestore se inicializan una vez.

### **4. Observer Pattern**
`onSnapshot()` para escuchar cambios en tiempo real.

---

## 🚀 ESCALABILIDAD

### **Actual:**
- ✅ Arquitectura modular
- ✅ Servicios separados
- ✅ Tipos TypeScript
- ✅ Componentes reutilizables

### **Futuro:**
- ⏳ Estado global (Zustand/Redux)
- ⏳ Cloud Functions para lógica backend
- ⏳ Caching con React Query
- ⏳ Lazy loading de componentes
- ⏳ PWA para web

---

## 📈 PERFORMANCE

### **Optimizaciones Implementadas:**
- ✅ `onSnapshot` para datos en tiempo real (sin polling)
- ✅ Componentes memoizados (`React.memo` en algunos)
- ✅ Lazy loading de imágenes

### **Optimizaciones Pendientes:**
- ⏳ Virtualized lists para listas largas
- ⏳ Image caching
- ⏳ Code splitting
- ⏳ Service Workers (PWA)

---

**Última actualización:** 25 de enero de 2026
