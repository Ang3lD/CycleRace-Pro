# 📱 Guía de Desarrollo para la Aplicación Móvil (React Native)

Basado en la arquitectura del sistema **CycleRace Pro**, este documento detalla los pasos, estructura y requisitos para desarrollar la aplicación móvil enfocada en los corredores utilizando **React Native y Expo**.

## 1. Stack Tecnológico Requerido

*   **Framework:** React Native (gestionado con Expo)
*   **Navegación:** React Navigation (Stack Navigation para flujos, Bottom Tabs para navegación principal)
*   **Cámara y Archivos:** `expo-camera` y `expo-image-picker` para adjuntar los comprobantes de pago.
*   **Notificaciones:** `expo-notifications` para recibir alertas de validación.
*   **Almacenamiento Local:** `@react-native-async-storage/async-storage` para persistir el JWT Token.
*   **Código QR:** `react-native-qrcode-svg` o librería similar para mostrar el número de competidor.
*   **Peticiones HTTP:** `axios` (con interceptores para manejar el JWT en cada petición).
*   **Gestor de Estado Global:** `zustand` (ligero y fácil de integrar).

## 2. Configuración Inicial del Proyecto

Para iniciar el proyecto, utiliza el siguiente comando en la terminal:

```bash
npx create-expo-app cycle-race-mobile
cd cycle-race-mobile
npx expo install react-native-safe-area-context react-native-screens expo-camera expo-image-picker expo-notifications @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs axios zustand react-native-qrcode-svg
```

## 3. Módulos y Flujos de Pantallas

### 3.1. Flujo de Autenticación (Auth Service)
*   **Pantalla de Login:** Ingreso con correo y contraseña.
*   **Pantalla de Registro:** Formulario para nuevos usuarios.
*   *Lógica:* Al hacer login exitoso (`POST /auth/login`), se guarda el JWT en `AsyncStorage`. Se debe contemplar la integración biométrica si el dispositivo lo soporta.

### 3.2. Flujo Principal (Bottom Tabs)

1.  **Home / Mi Competencia:** 
    *   Muestra el estado actual del corredor.
    *   Si no está inscrito, muestra botón "Inscribirse a Carrera".
    *   Si su pago está en proceso, muestra estado "Pendiente de Validación".
    *   Si está validado, muestra su **Código QR** grande en pantalla y su Número de Competidor para ser escaneado el día del evento.

2.  **Inscripción (Registration & Payment Service):**
    *   Formulario adaptado a pantallas táctiles para seleccionar categoría.
    *   Botón para **Abrir Cámara** (usando `expo-camera`) o **Galería** para subir el comprobante bancario.
    *   *Lógica:* Enviar la imagen como `FormData` o Base64 al microservicio de pagos.

3.  **Perfil:**
    *   Ver datos del corredor.
    *   Cerrar sesión (Borrar JWT y limpiar estado global).

## 4. Integración con Microservicios (API Gateway / Nginx)

La aplicación móvil no se conecta directamente a las bases de datos. Se comunicará con los microservicios (desplegados en AWS o localmente) a través del API Gateway o Proxy Inverso (Nginx).

```javascript
// Ejemplo de configuración de Axios con JWT
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.tuservidor.com' // Cambiar por tu dominio real
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 5. Notificaciones Push (Expo Notifications)
*   El usuario debe otorgar permisos de notificaciones. Se debe registrar el *Expo Push Token* del dispositivo en la base de datos (Auth Service) al hacer login.
*   Cuando el Administrador aprueba el pago en la Web, el backend debe enviar una notificación push al dispositivo del corredor indicando: *"¡Tu pago ha sido validado! Tu número de competidor es el #105"*.

## 6. Consideraciones de Diseño UI/UX
*   **Responsividad para Tablets:** El `README` especifica vistas en tablet. Usa `react-native-responsive-screen` o hooks personalizados basados en las dimensiones de la pantalla para renderizar un layout de 2 columnas en tablets.
*   **Modo Offline:** Asegúrate de cachear la información crítica (como el código QR) usando `AsyncStorage` para que el corredor pueda abrir la app y ver su código incluso si no hay buena cobertura de red el día de la carrera.
*   **UI Dinámica:** Utiliza feedback táctil y modales intuitivos para hacer el flujo de carga de imágenes más amigable.

---
> *Guía generada para facilitar la transición hacia la arquitectura móvil en React Native delineada en el README del proyecto CycleRace Pro.*
