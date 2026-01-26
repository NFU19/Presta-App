# 📦 SG-PRESTAMOS - Sistema de Gestión de Préstamos Universitarios

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)
![Completitud](https://img.shields.io/badge/Completitud-65%25-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-~54.0.20-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)

> Sistema móvil y web para la gestión de préstamos de equipos universitarios, desarrollado con React Native + Expo y Firebase.

---

## 🎯 Descripción del Proyecto

SG-PRESTAMOS es una aplicación multiplataforma que permite a estudiantes y docentes solicitar préstamos de equipos universitarios (laptops, proyectores, tablets, etc.) de forma digital. Los administradores pueden gestionar solicitudes, generar códigos QR para entrega/devolución, y monitorear el inventario en tiempo real.

### **Características Principales:**
- 🔐 Autenticación con Firebase (Login/Registro)
- 📱 App móvil para usuarios (React Native)
- 💻 Panel web para administradores
- 📦 Gestión completa de inventario de equipos
- ✅ Sistema de solicitud y aprobación de préstamos
- 🔲 Generación automática de códigos QR
- 📊 Dashboard con estadísticas (en desarrollo)
- 🔔 Notificaciones (próximamente)

---

## 📸 Screenshots

_Próximamente: Screenshots de la aplicación_

---

## 🚀 Inicio Rápido

### **Prerrequisitos:**
- Node.js >= 18.x
- npm o yarn
- Expo CLI
- Cuenta de Firebase
- Android Studio (para Android) o Xcode (para iOS)

### **Instalación:**

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/Presta-App.git
cd Presta-App
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Firebase:**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore
   - Copiar las credenciales en `firebaseConfig.ts`

4. **Iniciar la app:**
```bash
npm start
```

5. **Ejecutar en dispositivo:**
   - **Android:** Presiona `a`
   - **iOS:** Presiona `i`
   - **Web:** Presiona `w`

---

## 📁 Estructura del Proyecto

```
Presta-App/
├── app/                          # Pantallas (Expo Router)
│   ├── (tabs)/                   # Tabs de navegación (usuario)
│   │   ├── dashboard.tsx         # Dashboard de equipos
│   │   ├── history.tsx           # Historial de préstamos ✅
│   │   ├── favorites.tsx         # Favoritos
│   │   └── profile.tsx           # Perfil de usuario
│   ├── admin/                    # Pantallas de administrador
│   │   ├── index.tsx             # Dashboard admin
│   │   ├── equipos.tsx           # Gestión de equipos ✅
│   │   └── prestamos.tsx         # Gestión de préstamos ✅ NUEVO
│   ├── login.tsx                 # Pantalla de login
│   ├── register.tsx              # Pantalla de registro
│   ├── loan-request-modal.tsx    # Modal de solicitud ✅ ACTUALIZADO
│   └── product-details.tsx       # Detalles de equipo
├── components/                   # Componentes reutilizables
│   ├── shared/                   # Componentes compartidos
│   │   ├── product-card.tsx
│   │   ├── side-menu.tsx
│   │   └── header.tsx
│   └── ui/                       # Componentes UI
├── services/                     # Lógica de negocio ✅ NUEVO
│   └── prestamoService.ts        # Servicio de préstamos ✅
├── types/                        # Tipos TypeScript ✅ NUEVO
│   ├── prestamo.ts               # Tipos de préstamos ✅
│   └── navigation.ts
├── constants/                    # Constantes y temas
│   └── theme.ts
├── firebaseConfig.ts             # Configuración de Firebase
├── ANALISIS_Y_MEJORAS.md         # 📄 Análisis completo ✅ NUEVO
├── PROXIMOS_PASOS.md             # 📄 Guía de implementación ✅ NUEVO
├── RESUMEN_EJECUTIVO.md          # 📄 Resumen ejecutivo ✅ NUEVO
├── ARQUITECTURA.md               # 📄 Arquitectura del sistema ✅ NUEVO
└── package.json
```

---

## 🛠️ Tecnologías Utilizadas

### **Frontend:**
- **React Native** - Framework móvil
- **Expo** - Toolchain y SDK
- **TypeScript** - Tipado estático
- **Expo Router** - Navegación basada en archivos

### **Backend:**
- **Firebase Authentication** - Autenticación de usuarios
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Storage** - Almacenamiento de imágenes (futuro)
- **Cloud Functions** - Backend serverless (futuro)

### **UI/UX:**
- **React Native Paper** (considerando)
- **Expo Vector Icons** - Iconos
- **React Native Reanimated** - Animaciones

---

## 📊 Estado del Proyecto

### **Completitud: 65%**

#### ✅ **Implementado:**
- [x] Login y registro con Firebase Auth
- [x] Redirección por roles (admin/user)
- [x] Dashboard de equipos con búsqueda
- [x] CRUD de equipos (admin)
- [x] Sistema completo de solicitud de préstamos ⭐ **NUEVO**
- [x] Panel de aprobación/rechazo de préstamos (admin) ⭐ **NUEVO**
- [x] Generación automática de códigos QR ⭐ **NUEVO**
- [x] Historial de préstamos con datos reales ⭐ **NUEVO**
- [x] Validaciones de negocio (límite 3 préstamos, disponibilidad) ⭐ **NUEVO**

#### 🚧 **En Desarrollo:**
- [ ] Escaneo de códigos QR (RF-6)
- [ ] Gestión de usuarios (CRUD alumnos/docentes) (RF-1)
- [ ] Dashboard con gráficos (RF-8)
- [ ] Notificaciones push
- [ ] Recuperación de contraseña

#### 📅 **Próximamente:**
- [ ] Favoritos funcionales
- [ ] Perfil de usuario completo
- [ ] Búsqueda avanzada con filtros
- [ ] Dark mode
- [ ] Exportar reportes (PDF/Excel)

---

## 📚 Documentación

- **[ANALISIS_Y_MEJORAS.md](ANALISIS_Y_MEJORAS.md)** - Análisis completo del código, brechas identificadas y mejoras implementadas
- **[PROXIMOS_PASOS.md](PROXIMOS_PASOS.md)** - Guía paso a paso para completar las funcionalidades faltantes
- **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Resumen ejecutivo del proyecto y su estado
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Arquitectura del sistema, modelo de datos y patrones de diseño

---

## 🤝 Contribuir

### **Flujo de trabajo:**
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### **Convenciones de código:**
- TypeScript para todo el código
- ESLint para linting
- Prettier para formateo
- Nombres descriptivos de variables y funciones
- Comentarios en español para lógica compleja

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/tu-usuario/Presta-App/issues) con:
- Descripción del problema
- Pasos para reproducir
- Screenshots (si aplica)
- Versión de la app y dispositivo

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia el servidor de desarrollo
npm run android        # Ejecuta en Android
npm run ios            # Ejecuta en iOS
npm run web            # Ejecuta en navegador

# Linting
npm run lint           # Ejecuta ESLint

# Producción
npm run build          # Construye la app para producción
```

---

## 🔒 Seguridad

### **Importante:**
- **NO** subas credenciales de Firebase al repositorio
- Usa variables de entorno (`.env`)
- Configura reglas de seguridad en Firestore
- Ver [ANALISIS_Y_MEJORAS.md](ANALISIS_Y_MEJORAS.md) para más detalles

---

## 📄 Licencia

Este proyecto es para uso académico. Todos los derechos reservados.

---

## 👥 Equipo

- **Frontend Developer** - [Tu nombre]
- **Arquitecto de Software** - Asesor del proyecto

---

## 🙏 Agradecimientos

- Universidad [Nombre]
- Profesores del curso
- Comunidad de Expo y React Native
- Firebase

---

## 📞 Contacto

- **Email:** tu-email@ejemplo.com
- **GitHub:** [@tu-usuario](https://github.com/tu-usuario)

---

## 🔗 Enlaces Útiles

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Última actualización:** 25 de enero de 2026

---

_Made with ❤️ using React Native + Expo + Firebase_
