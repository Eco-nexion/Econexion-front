# 🌱 Econexion - Plataforma de Gestión de Residuos Reciclables

<div align="center">

![Econexion Logo](src/assets/images/icon.png)

**Conectando generadores de residuos con recicladores para un futuro más sostenible**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.10-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Resumen del Proyecto

**Econexion** es una aplicación móvil multiplataforma que facilita la comercialización y gestión de residuos reciclables. La plataforma conecta dos tipos de usuarios:

- **🏭 Generadores**: Empresas o individuos que generan residuos reciclables y desean monetizarlos
- **♻️ Recicladores**: Empresas o personas que compran residuos para su procesamiento y reciclaje

### ✨ Características Principales

- 🔐 Sistema de autenticación con JWT
- 📦 Publicación y gestión de lotes de residuos
- 💰 Sistema de ofertas y contraoferta
- 🔍 Búsqueda y filtrado de lotes disponibles
- 📊 Historial de transacciones
- 👤 Perfiles diferenciados por tipo de usuario
- 🔔 Notificaciones en tiempo real (próximamente)

---

## 📱 Pantallas Implementadas

### 🔐 Autenticación

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| **Landing** | `/` | Página de bienvenida con acceso a registro |
| **Login** | `/(auth)/login` | Inicio de sesión con email y contraseña |
| **Registro** | `/(auth)/register` | Formulario de registro de usuario |
| **Resumen Registro** | `/(auth)/register/summary` | Confirmación de datos de registro |

### 🏭 Dashboard Generador

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| **Home Generador** | `/(dashboard)/index` | Vista principal con ofertas recibidas y estadísticas |
| **Publicar Lote** | `/(dashboard)/publish` | Formulario para crear nuevas publicaciones de residuos |
| **Ofertas** | `/(dashboard)/offers` | Lista de ofertas recibidas con filtros |
| **Transacciones** | `/(dashboard)/transactions` | Historial de transacciones completadas |
| **Perfil** | `/(dashboard)/profile` | Información del usuario y configuración |

### ♻️ Dashboard Reciclador

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| **Home Reciclador** | `/(dashboard)/search` | Búsqueda de lotes disponibles con barra de búsqueda |
| **Ofertas** | `/(dashboard)/offers` | Lista de ofertas enviadas con estados |
| **Transacciones** | `/(dashboard)/transactions` | Historial de compras completadas |
| **Perfil** | `/(dashboard)/profile` | Información del usuario y configuración |

### 🎨 Componentes Reutilizables

- **BottomNav**: Navegación inferior con tabs diferenciados por tipo de usuario
- **Header**: Encabezado con título y botones de acción
- **Cards**: Tarjetas para lotes, ofertas y transacciones

---

## 🛠️ Stack Tecnológico

- **Framework**: React Native 0.81.4
- **Navegación**: Expo Router 6.0.8 (File-based routing)
- **UI**: React Native Components (sin librerías externas)
- **Estado**: React Context API
- **HTTP**: Axios 1.12.2
- **Storage**: AsyncStorage 2.2.0
- **Animaciones**: React Native Reanimated 4.1.0
- **Gestos**: React Native Gesture Handler 2.28.0
- **Tipado**: TypeScript 5.9.2
- **Linter**: Biome 2.2.4

---

## 📋 Requisitos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

- **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- **pnpm** >= 8.x (Gestor de paquetes recomendado)
- **Git** ([Descargar](https://git-scm.com/))

### Instalación de pnpm

```bash
# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows (PowerShell como Administrador)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# O usando npm
npm install -g pnpm
```

### Herramientas de Desarrollo (Opcional)

Para ejecutar en emuladores locales:

- **Android Studio** con Android SDK ([Guía](https://docs.expo.dev/workflow/android-studio-emulator/))
- **Xcode** (solo macOS) para iOS ([Guía](https://docs.expo.dev/workflow/ios-simulator/))

### Backend

El proyecto requiere el backend de Econexion corriendo:

```bash
# Backend debe estar corriendo en:
http://localhost:8080
```

Repositorio del backend: [Econexion-back](https://github.com/Eco-nexion/Econexion-back)

---

## 🚀 Instalación y Ejecución

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Eco-nexion/Econexion-front.git
cd Econexion-front
```

### 2️⃣ Cambiar a la Rama de Desarrollo

```bash
git checkout develop
```

### 3️⃣ Instalar Dependencias

```bash
pnpm install
```

### 4️⃣ Configurar Variables de Entorno (Opcional)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=587933647930-5655phuhtfgo9ska2i9euumigl3eh5in.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=587933647930-b0u33ajp7v0n07nouluofcgfm1cah7b2.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=587933647930-gtqf8tlukjfllhfqfctc5jvot80oe73b.apps.googleusercontent.com
```

### 5️⃣ Iniciar el Servidor de Desarrollo

```bash
pnpm start
```

Esto abrirá Expo Dev Tools en tu navegador.

### 6️⃣ Ejecutar en Diferentes Plataformas

#### 📱 Dispositivo Físico (Recomendado para desarrollo)

1. Instala **Expo Go** desde:
    - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
    - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Escanea el QR code que aparece en la terminal o en Expo Dev Tools

#### 🤖 Android Emulator

```bash
pnpm android
```

#### 🍎 iOS Simulator (solo macOS)

```bash
pnpm ios
```

#### 🌐 Web (Desarrollo)

```bash
pnpm web
```

---

## 📂 Estructura del Proyecto

```
econexion-reactnative/
├── app/                          # Rutas de la aplicación (File-based routing)
│   ├── (auth)/                  # Grupo de autenticación
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register/
│   │       ├── index.tsx
│   │       └── summary.tsx
│   │
│   ├── (dashboard)/             # Grupo de dashboard (protegido)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Dashboard Generador
│   │   ├── search.tsx          # Dashboard Reciclador
│   │   ├── publish.tsx
│   │   ├── offers.tsx
│   │   ├── transactions.tsx
│   │   └── profile.tsx
│   │
│   ├── index.tsx               # Landing page
│   └── _layout.tsx             # Root layout
│
├── src/
│   ├── components/             # Componentes reutilizables
│   │   └── common/
│   │       └── BottomNav.tsx
│   │
│   ├── services/              # Servicios API
│   │   └── api/
│   │       ├── axiosConfig.ts
│   │       ├── auth.service.ts
│   │       ├── posts.service.ts
│   │       └── offers.service.ts
│   │
│   ├── context/               # Context API
│   │   └── AuthContext.tsx
│   │
│   ├── types/                 # TypeScript types
│   │   ├── forms.ts
│   │   └── index.ts
│   │
│   ├── constants/             # Constantes globales
│   │   └── index.ts
│   │
│   └── utils/                 # Utilidades
│       └── index.ts
│
├── assets/                    # Assets estáticos
│   └── images/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 Integración con Backend

### Endpoints Utilizados

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

#### Posts (Lotes)
- `GET /api/posts` - Obtener todos los lotes
- `POST /api/posts/new` - Crear nuevo lote
- `PUT /api/posts/update/:id` - Actualizar lote
- `DELETE /api/posts/delete/:id` - Eliminar lote

#### Ofertas
- `GET /api/offers` - Obtener todas las ofertas
- `POST /api/offers/new` - Crear nueva oferta
- `PUT /api/offers/update/:id` - Actualizar oferta
- `DELETE /api/offers/:id` - Eliminar oferta

### Configuración de API

La URL base del API se configura en `src/services/api/axiosConfig.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

Para diferentes entornos:

| Entorno | URL |
|---------|-----|
| **Localhost** | `http://localhost:8080/api` |
| **Android Emulator** | `http://10.0.2.2:8080/api` |
| **iOS Simulator** | `http://localhost:8080/api` |
| **Dispositivo Físico** | `http://TU_IP_LOCAL:8080/api` |

---

## 🧪 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
pnpm start

# Ejecutar en Android
pnpm android

# Ejecutar en iOS (solo macOS)
pnpm ios

# Ejecutar en web
pnpm web

# Linter
pnpm lint

# Formatear código
pnpm format

# Resetear proyecto (limpia caché)
pnpm reset-project
```

---

## 🔐 Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Se hace `POST` a `/api/auth/login`
3. Backend retorna `token` y datos del `user`
4. Token se guarda en `AsyncStorage`
5. User se guarda en `AuthContext`
6. Usuario es redirigido a `/(dashboard)`
7. En cada request, el token se envía en header `Authorization`

---

## 🎨 Guía de Estilos

### Colores

```typescript
Colors.ecoGreen = '#20df26'    // Color principal
Colors.lightGray = '#f6f8f6'   // Background
Colors.gray = '#999'           // Texto secundario
Colors.cyan = '#00bcd4'        // Accent
```

### Espaciados

```typescript
Spacing.xs = 4
Spacing.sm = 8
Spacing.md = 16
Spacing.lg = 24
Spacing.xl = 32
```

---

## 🐛 Troubleshooting

### Problema: "Network Error" al hacer login

**Solución**:
```bash
# Verifica que el backend esté corriendo
curl http://localhost:8080/api/health

# Si usas Android Emulator, actualiza la URL en axiosConfig.ts
const API_BASE_URL = 'http://10.0.2.2:8080/api';

# Si usas dispositivo físico, usa tu IP local
const API_BASE_URL = 'http://192.168.1.XXX:8080/api';
```

### Problema: "Cannot find module '@/src/...'"

**Solución**:
```bash
# Limpiar caché
pnpm start --clear

# O resetear el proyecto
pnpm reset-project
```

### Problema: Expo Go no conecta

**Solución**:
- Asegúrate de estar en la misma red WiFi
- Desactiva VPN o firewall temporalmente
- Reinicia Expo Dev Server: `pnpm start --clear`

---

## 📚 Recursos Adicionales

- [Documentación de Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## 👥 Equipo de Desarrollo

- **Frontend**: Equipo Econexion Mobile
- **Backend**: Equipo Econexion API
- **Repositorio Backend**: [econexion-app](https://github.com/Eco-nexion/econexion-app)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

<div align="center">

**Hecho con 💚 por el equipo Econexion**

[Reportar Bug](https://github.com/Eco-nexion/econexion-reactnative/issues) · [Solicitar Feature](https://github.com/Eco-nexion/econexion-reactnative/issues)

</div>