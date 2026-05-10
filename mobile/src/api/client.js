import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------------
// Cambia esta URL a la de tu servidor / ngrok / IP local
// Ejemplo local:  http://192.168.1.100
// Ejemplo cloud:  https://api.cycleracepro.com
// -------------------------------------------------------
const BASE_URL = 'http://192.168.1.81';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor — inyecta JWT en cada petición autenticada
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cyclerace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — manejo global de errores 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('cyclerace_token');
      // Navigation reset should be handled at the store/context level
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
