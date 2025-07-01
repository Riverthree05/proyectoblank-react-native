import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Obtener URL de la API desde la configuración
const getApiUrl = () => {
  // Intentar obtener la URL del archivo .env a través de la configuración de Expo
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  
  if (configUrl) {
    return configUrl;
  }
  
  // URLs de fallback según el entorno
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000'; // Para emuladores Android
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:4000'; // Para simuladores iOS
  } else {
    return 'http://localhost:4000'; // Para web
  }
};

// Obtener configuración de la base de datos
export const DB_CONFIG = Constants.expoConfig?.extra?.database || {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cobranza'
};

// URL de la API para usar en toda la aplicación
export const API_URL = getApiUrl();

// Configuración por defecto para las solicitudes fetch
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 segundos
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Sistema
  PING: '/api/ping',
  
  // Autenticación
  LOGIN: '/api/usuario/login',
  REGISTER: '/api/usuario/agregar',
  TEST: '/api/usuario/test',
    // Control de casa inteligente
  LUCES: {
    GET_ALL: '/api/luces',                   // Obtener estado de todas las luces
    GET_BY_UBICACION: '/api/luces/ubicacion/', // Filtrar luces por ubicación (agregar ubicación)
    GET_ONE: '/api/luces/',                  // Obtener estado de una luz específica (agregar ID)
    TOGGLE: '/api/luces/toggle/',            // Cambiar estado de una luz (agregar ID)
    UPDATE: '/api/luces/update/',            // Actualizar configuración de una luz (agregar ID)
  },
  
  PUERTAS: {
    GET_ALL: '/api/puertas',                 // Obtener estado de todas las puertas
    GET_BY_TIPO: '/api/puertas/tipo/',       // Filtrar puertas por tipo (agregar tipo)
    GET_ONE: '/api/puertas/',                // Obtener estado de una puerta específica (agregar ID)
    LOCK: '/api/puertas/lock/',              // Cerrar una puerta (agregar ID)
    UNLOCK: '/api/puertas/unlock/',          // Abrir una puerta (agregar ID)
  }
};
