import { Platform, Alert } from 'react-native';
import { API_URL, API_CONFIG, API_ENDPOINTS } from './apiConfig';

// Array de URLs base para probar si la conexión principal falla
const BASE_URLS = [
  // URL principal desde la configuración
  API_URL,
  
  // URLs de respaldo para diferentes entornos
  'http://10.0.2.2:4000',       // Para emulador Android (apunta a localhost en la máquina host)
  'http://127.0.0.1:4000',      // localhost alternativo
  'http://localhost:4000',      // localhost común
  'http://192.168.0.1:4000',    // Router común
  'http://192.168.1.1:4000',    // Router común alternativo
  'http://192.168.0.8:4000',    // IP alternativa
  'http://192.168.1.10:4000',   // IP alternativa
  'http://192.168.0.100:4000',  // IP alternativa
  'http://192.168.1.100:4000',  // IP alternativa
  'http://192.168.0.254:4000',  // IP alternativa
  'http://192.168.1.254:4000'   // IP alternativa
];

// Tiempo máximo de espera aumentado a 15 segundos para redes más lentas
const FETCH_TIMEOUT = 15000;

/**
 * Envía una solicitud intentando múltiples endpoints en caso de falla
 * 
 * @param {string} endpoint - Ruta del endpoint de la API (ej: '/api/usuario/login')
 * @param {object} options - Opciones para fetch
 * @returns {Promise<object>} - Promesa con la respuesta
 */
export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
  };
  
  console.log(`Realizando solicitud a ${endpoint}`);
  
  // Timeout para manejar conexiones lentas
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tiempo de espera agotado')), FETCH_TIMEOUT);
  });
  
  // Intentar cada URL base hasta que una funcione
  let lastError = null;
  
  // Si no tenemos una URL exitosa guardada, intentamos encontrar una
  if (!global.LAST_SUCCESSFUL_URL) {
    console.log('No hay URL guardada, verificando conexión...');
    const availableUrl = await checkServerAvailability();
    if (availableUrl) {
      global.LAST_SUCCESSFUL_URL = availableUrl;
    }
  }
  
  // Si ya tenemos una URL base exitosa previa, intentarla primero
  if (global.LAST_SUCCESSFUL_URL) {
    try {
      console.log(`Intentando URL preferida: ${global.LAST_SUCCESSFUL_URL}${endpoint}`);
      const result = await tryFetch(`${global.LAST_SUCCESSFUL_URL}${endpoint}`, fetchOptions, timeoutPromise);
      return result;
    } catch (error) {
      console.log('URL preferida falló, intentando alternativas...');
      lastError = error;
    }
  }
  
  // Intentar todas las URLs disponibles
  for (const baseUrl of BASE_URLS) {
    // Saltar la URL preferida si ya la intentamos
    if (baseUrl === global.LAST_SUCCESSFUL_URL) continue;
    
    try {
      console.log(`Intentando conectar a: ${baseUrl}${endpoint}`);
      
      const result = await tryFetch(`${baseUrl}${endpoint}`, fetchOptions, timeoutPromise);
      // Guardar la URL exitosa para futuros intentos
      global.LAST_SUCCESSFUL_URL = baseUrl;
      console.log('Conexión exitosa con:', baseUrl);
      return result;
    } catch (error) {
      console.error(`Error con ${baseUrl}:`, error.message);
      lastError = error;
    }
  }
    // Si llegamos aquí, todas las URLs fallaron
  const error = lastError || new Error('No se pudo conectar a ningún servidor');
  
  // Mostrar recomendaciones adicionales solo si no hay otras alertas ya visibles
  if (!global.ERROR_ALERT_ACTIVE) {
    global.ERROR_ALERT_ACTIVE = true;
    
    Alert.alert(
      'No se pudo conectar al servidor',
      'Sugerencias para solucionar el problema:\n\n' +
      '1. Verifica que el servidor Express está ejecutándose\n' +
      '2. Comprueba la IP y puerto del servidor (actualmente: ' + API_URL + ')\n' +
      '3. Asegúrate de que el dispositivo está en la misma red WiFi que el servidor\n\n' +
      'Para desarrolladores: Abre apiConfig.js y cambia la variable API_URL a la IP correcta de tu servidor.',
      [{
        text: 'OK',
        onPress: () => {
          global.ERROR_ALERT_ACTIVE = false;
        }
      }]
    );
  }
  
  throw error;
};

/**
 * Función auxiliar para intentar una solicitud fetch con timeout
 */
async function tryFetch(url, options, timeoutPromise) {
  try {
    console.log(`Conectando a ${url}...`);
    
    // Competir entre fetch y timeout
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise
    ]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error HTTP ${response.status} de ${url}: ${errorText}`);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }
    
    console.log(`Respuesta recibida de ${url}`);
    const responseText = await response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Error al parsear respuesta JSON:`, parseError);
      console.error(`Respuesta recibida: ${responseText.substring(0, 100)}...`);
      throw new Error('Formato de respuesta inválido');
    }
  } catch (error) {
    console.error(`Error en solicitud a ${url}:`, error.message);
    throw error;
  }
}

/**
 * Función para iniciar sesión
 * 
 * @param {object} credentials - Credenciales del usuario (email y pw)
 * @returns {Promise<object>} - Promesa con la respuesta del servidor
 */
export const loginUser = async (credentials) => {
  try {
    console.log('Iniciando sesión con:', credentials.email);
    const response = await apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('Respuesta login:', response);
    return response;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Función para registrar un nuevo usuario
 * 
 * @param {object} userData - Datos del usuario a registrar
 * @returns {Promise<object>} - Promesa con la respuesta del servidor
 */
export const registerUser = async (userData) => {
  try {
    console.log('Registrando usuario:', userData.email);
    
    // Log más detallado para diagnóstico (ocultando la contraseña)
    console.log('Datos de registro:', {
      ...userData,
      pw: '********' // No mostrar contraseña en logs
    });
    
    const response = await apiRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('Respuesta registro:', response);
    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * Maneja errores de API de forma amigable para el usuario
 * 
 * @param {Error} error - Error capturado
 * @param {string} operacion - Descripción de la operación que falló
 */
export const handleApiError = (error, operacion) => {
  console.error(`Error en ${operacion}:`, error);
  
  let title = 'Error de conexión';
  let message = 'No se pudo conectar al servidor.';
  
  if (error.message.includes('Network request failed')) {
    message = 'No se pudo establecer conexión con el servidor. Verifica:\n\n' +
              '1. Que el servidor Express esté activo\n' +
              '2. Que estés conectado a la misma red WiFi que el servidor\n' + 
              '3. Que el firewall no esté bloqueando la conexión';
    
    if (Platform.OS === 'android') {
      message += '\n\n→ Si estás en un emulador Android, debes usar 10.0.2.2 en lugar de localhost';
      message += '\n→ Si estás en un dispositivo físico, necesitas usar la IP real del servidor (ej: 192.168.x.x)';
      message += '\n→ Revisa que tu app tenga permisos de Internet en AndroidManifest.xml';
    } else if (Platform.OS === 'ios') {
      message += '\n\n→ Si estás en un simulador iOS, asegúrate que el servidor esté corriendo en tu Mac';
      message += '\n→ Si estás en un dispositivo físico, necesitas usar la IP real del servidor';
    }
    
    message += '\n\nConsejo: Encuentra la IP de tu PC servidor con "ipconfig" en Windows o "ifconfig" en Mac/Linux.';
  } else if (error.message.includes('JSON')) {
    title = 'Error en respuesta';
    message = 'El servidor respondió con un formato inesperado. Verifica que el backend esté enviando respuestas JSON válidas.';
  } else if (error.message.includes('Error HTTP 404')) {
    title = 'Error del servidor';
    message = 'El endpoint solicitado no existe en el servidor (Error 404).\n\n' +
              'Esto puede deberse a:\n' +
              '1. El endpoint no está implementado en el backend\n' +
              '2. La ruta está mal configurada\n' +
              '3. El método HTTP no es compatible (GET vs POST)\n\n' +
              'Verifica que los endpoints para control de luces y puertas existan en el servidor Express.';
  } else if (error.message.includes('Error HTTP')) {
    title = 'Error del servidor';
    message = error.message + '\n\nRevisa los logs del servidor Express para más detalles.';
  } else if (error.message.includes('agotado')) {
    message = 'El servidor tardó demasiado en responder. Verifica que el servidor esté activo y accesible.' +
              '\n\nPrueba una de estas soluciones:' +
              '\n1. Reinicia el servidor Express' +
              '\n2. Revisa si hay errores en la consola del servidor' +
              '\n3. Prueba con una IP diferente en apiConfig.js';
  } else if (error.message.includes('Failed to fetch')) {
    message = 'Error de red: No se pudo conectar al servidor. Verifica tu conexión a internet y la dirección del servidor.';
  }
  
  Alert.alert(
    title, 
    message,
    [{ 
      text: 'Entendido',
      style: 'cancel'
    }]
  );
};

/**
 * Funciones para el control de luces
 */

/**
 * Obtiene el estado de todas las luces
 */
export const getAllLights = async () => {
  try {
    const response = await apiRequest(API_ENDPOINTS.LUCES.GET_ALL, {
      method: 'GET',
    });
    console.log('Respuesta luces:', response);
    
    // Adaptar el formato de respuesta del backend a lo esperado por el frontend
    if (response) {
      // Verificar si la respuesta tiene formato con "body" (nuevo formato de API)
      const luces = response.body || response;
      
      if (Array.isArray(luces)) {
        // Convertir el formato del backend al formato que espera nuestro frontend
        const lucesFormateadas = luces.map(luz => ({
          id: luz.id,
          nombre: luz.ubicacion, // Usar ubicación como nombre
          estado: luz.status === 1, // Convertir 0/1 a boolean
        }));
        return { status: true, data: lucesFormateadas };
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener luces:', error);
    handleApiError(error, 'obtener estado de las luces');
    throw error;
  }
};

/**
 * Obtiene el estado de una luz específica
 * 
 * @param {string|number} id - ID de la luz
 */
export const getLight = async (id) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.LUCES.GET_ONE}${id}`, {
      method: 'GET',
    });
    console.log(`Respuesta luz ${id}:`, response);
    
    // Adaptar el formato de respuesta
    if (response) {
      // Verificar si la respuesta tiene formato con "body" (nuevo formato de API)
      const luz = response.body || response;
      
      if (luz) {
        return {
          status: true,
          data: {
            id: luz.id,
            nombre: luz.ubicacion,
            estado: luz.status === 1
          }
        };
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Error al obtener luz ${id}:`, error);
    handleApiError(error, 'obtener estado de la luz');
    throw error;
  }
};

/**
 * Cambia el estado de una luz (encendido/apagado)
 * 
 * @param {string|number} id - ID de la luz
 * @param {boolean} nuevoEstado - Nuevo estado de la luz (true=encendido, false=apagado)
 */
export const toggleLight = async (id, nuevoEstado) => {
  try {
    // Convertir el boolean a 0/1 que espera el backend
    const statusValue = nuevoEstado ? 1 : 0;
    
    console.log(`Intentando actualizar luz ${id} a estado: ${statusValue}`);
    
    // Usar el endpoint correcto para actualizar estado de luces
    const response = await apiRequest(`/api/luces/estado/${id}`, {
      method: 'POST',  // Usar POST según la especificación del backend
      body: JSON.stringify({
        status: statusValue
      }),
    });
    
    console.log(`Respuesta actualizar luz ${id}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al cambiar estado de luz ${id}:`, error);
    handleApiError(error, 'cambiar estado de la luz');
    throw error;
  }
};

/**
 * Funciones para el control de puertas
 */

/**
 * Obtiene el estado de todas las puertas
 */
export const getAllDoors = async () => {
  try {
    const response = await apiRequest(API_ENDPOINTS.PUERTAS.GET_ALL, {
      method: 'GET',
    });
    console.log('Respuesta puertas:', response);
    
    // Adaptar el formato de respuesta del backend a lo esperado por el frontend
    if (response) {
      // Verificar si la respuesta tiene formato con "body" (nuevo formato de API)
      const puertas = response.body || response;
      
      if (Array.isArray(puertas)) {
        // Convertir el formato del backend al formato que espera nuestro frontend
        const puertasFormateadas = puertas.map(puerta => ({
          id: puerta.id,
          nombre: puerta.ubicacion, // Usar ubicación como nombre
          cerrada: puerta.status === 0, // status=0 significa cerrada
          bloqueada: puerta.status === 0, // Asumimos que cerrada=bloqueada para simplificar
        }));
        return { status: true, data: puertasFormateadas };
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener puertas:', error);
    handleApiError(error, 'obtener estado de las puertas');
    throw error;
  }
};

/**
 * Obtiene el estado de una puerta específica
 * 
 * @param {string|number} id - ID de la puerta
 */
export const getDoor = async (id) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.PUERTAS.GET_ONE}${id}`, {
      method: 'GET',
    });
    console.log(`Respuesta puerta ${id}:`, response);
    
    // Adaptar el formato de respuesta
    if (response) {
      // Verificar si la respuesta tiene formato con "body" (nuevo formato de API)
      const puerta = response.body || response;
      
      if (puerta) {
        return {
          status: true,
          data: {
            id: puerta.id,
            nombre: puerta.ubicacion,
            cerrada: puerta.status === 0,
            bloqueada: puerta.status === 0
          }
        };
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Error al obtener puerta ${id}:`, error);
    handleApiError(error, 'obtener estado de la puerta');
    throw error;
  }
};

/**
 * Cambia el estado de una puerta (abierta/cerrada)
 * 
 * @param {string|number} id - ID de la puerta
 * @param {boolean} cerrar - Si es true, cierra la puerta; si es false, la abre
 */
export const toggleDoorState = async (id, cerrar) => {
  try {
    // Convertir el boolean a 0/1 que espera el backend (0=cerrada, 1=abierta)
    const statusValue = cerrar ? 0 : 1;
    
    console.log(`Intentando cambiar puerta ${id} a estado: ${statusValue} (${cerrar ? 'cerrada' : 'abierta'})`);
    
    // Usar el endpoint correcto para actualizar estado de puertas
    const response = await apiRequest(`/api/puertas/estado/${id}`, {
      method: 'POST',  // Usar POST según la especificación del backend
      body: JSON.stringify({
        status: statusValue
      }),
    });
    
    console.log(`Respuesta cambiar puerta ${id} a ${cerrar ? 'cerrada' : 'abierta'}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al cambiar estado de puerta ${id}:`, error);
    handleApiError(error, cerrar ? 'cerrar la puerta' : 'abrir la puerta');
    throw error;
  }
};

// Funciones de conveniencia que utilizan toggleDoorState
export const lockDoor = async (id) => toggleDoorState(id, true);
export const unlockDoor = async (id) => toggleDoorState(id, false);

/**
 * Obtiene luces por ubicación (salón, cocina, dormitorio, etc.)
 * 
 * @param {string} ubicacion - Ubicación de las luces
 */
export const getLightsByLocation = async (ubicacion) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.LUCES.GET_BY_UBICACION}${ubicacion}`, {
      method: 'GET',
    });
    console.log(`Respuesta luces ubicación ${ubicacion}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al obtener luces de ${ubicacion}:`, error);
    handleApiError(error, `obtener luces de ${ubicacion}`);
    throw error;
  }
};

/**
 * Obtiene puertas por tipo (exterior, interior, garajes, etc.)
 * 
 * @param {string} tipo - Tipo de puertas
 */
export const getDoorsByType = async (tipo) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.PUERTAS.GET_BY_TIPO}${tipo}`, {
      method: 'GET',
    });
    console.log(`Respuesta puertas tipo ${tipo}:`, response);
    return response;
  } catch (error) {
    console.error(`Error al obtener puertas de tipo ${tipo}:`, error);
    handleApiError(error, `obtener puertas de tipo ${tipo}`);
    throw error;
  }
};

/**
 * Función para verificar si el servidor está disponible
 * Devuelve la primera URL que responde correctamente o null si ninguna funciona
 */
export const checkServerAvailability = async () => {
  let timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tiempo de espera agotado')), 5000);
  });

  // Intentar cada URL para ver cuál funciona
  for (const baseUrl of BASE_URLS) {
    try {
      console.log(`Verificando disponibilidad de: ${baseUrl}/api/ping`);
      
      // Solo verificamos si el servidor responde, no importa el contenido
      const response = await Promise.race([
        fetch(`${baseUrl}/api/ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }),
        timeoutPromise
      ]);
      
      // Si la respuesta es exitosa (incluso si el endpoint no existe exactamente)
      if (response.status < 500) {
        console.log(`Servidor encontrado en: ${baseUrl}`);
        global.LAST_SUCCESSFUL_URL = baseUrl;
        return baseUrl;
      }
    } catch (error) {
      console.log(`Servidor no disponible en: ${baseUrl}`);
    }
  }
  
  console.log('No se encontró ningún servidor disponible');
  return null;
}

/**
 * Utilidad para mostrar información de depuración de red
 * Útil para diagnosticar problemas de conexión
 */
export const showNetworkDebugInfo = () => {
  // Para pruebas en desarrollo, mostramos datos de conexión
  Alert.alert(
    'Información de Depuración',
    'URLs de servidor que se están intentando:\n\n' +
    BASE_URLS.join('\n') +
    '\n\nÚltima URL exitosa: ' +
    (global.LAST_SUCCESSFUL_URL || 'Ninguna') +
    '\n\nComo desarrollador, verifica que el servidor Express esté corriendo en una de estas direcciones.',
    [
      {
        text: 'Reintentar Conexión',
        onPress: async () => {
          // Reiniciar la conexión y limpiar caché
          global.LAST_SUCCESSFUL_URL = null;
          const availableUrl = await checkServerAvailability();
          
          if (availableUrl) {
            Alert.alert('Éxito', `Conexión establecida con: ${availableUrl}`);
          } else {
            Alert.alert('Error', 'No se pudo conectar a ningún servidor. Verifica que el servidor esté activo y en la misma red.');
          }
        }
      },
      {
        text: 'Cerrar',
        style: 'cancel'
      }
    ]
  );
};

/**
 * Función de utilidad para diagnosticar problemas de actualización de estado
 * Muestra información sobre los endpoints disponibles y su funcionamiento
 */
export const showApiEndpointsInfo = () => {
  Alert.alert(
    'Información de API',
    `Endpoints configurados:
    
    Luces:
    - GET Todos: ${API_ENDPOINTS.LUCES.GET_ALL}
    - GET por ID: ${API_ENDPOINTS.LUCES.GET_ONE}:id
    - Cambiar estado: /api/luces/estado/:id
    
    Puertas:
    - GET Todos: ${API_ENDPOINTS.PUERTAS.GET_ALL}
    - GET por ID: ${API_ENDPOINTS.PUERTAS.GET_ONE}:id
    - Cambiar estado: /api/puertas/estado/:id
    
    URL Base: ${API_URL}
    
    Formato para actualizar estado:
    - Método: POST
    - Body: { "status": 1 } (1=encendido/abierto, 0=apagado/cerrado)
    
    Para resolver problemas de actualización:
    1. Verifica que el servidor esté activo y respondiendo
    2. Confirma que puedes obtener la lista de dispositivos
    3. Comprueba que estás usando los endpoints y métodos correctos
    `,
    [{ text: 'Entendido' }]
  );
};
