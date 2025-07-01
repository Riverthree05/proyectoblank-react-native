import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getAllDoors, toggleDoorState, showNetworkDebugInfo } from '../../utils/api'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function PuertaCasa() {
  const [puertas, setPuertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  // Cargar el estado inicial de las puertas
  useEffect(() => {
    cargarPuertas();
  }, []);
  // Función para cargar el estado de las puertas
  const cargarPuertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const respuesta = await getAllDoors();
        if (respuesta && respuesta.status) {
        setPuertas(respuesta.data || []);
      } else {
        // Datos de ejemplo si no hay respuesta del servidor
        const puertasEjemplo = [
          { id: 1, nombre: 'Puerta Principal', cerrada: true },
          { id: 2, nombre: 'Puerta Trasera', cerrada: true },
          { id: 3, nombre: 'Garaje Principal', cerrada: false },
          { id: 4, nombre: 'Portón Exterior', cerrada: true },
          { id: 5, nombre: 'Puerta Dormitorio', cerrada: false },
          { id: 6, nombre: 'Puerta Cocina', cerrada: true },
          { id: 7, nombre: 'Puerta Baño', cerrada: true },
          { id: 8, nombre: 'Garaje Secundario', cerrada: false },
        ];
        
        setPuertas(puertasEjemplo);
      }    } catch (error) {
      console.error('Error al cargar puertas:', error);
      setError(error.message);
      setError('Error al cargar las puertas.'); // Actualizar estado de error
      // Datos de ejemplo en caso de error
      const puertasEjemplo = [
        { id: 1, nombre: 'Puerta Principal', cerrada: true },
        { id: 2, nombre: 'Puerta Trasera', cerrada: true },
      ];
      
      setPuertas(puertasEjemplo);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para cambiar el estado de una puerta (cerrar/abrir)
  const cambiarEstadoPuerta = async (id, estadoActual) => {
    try {
      // Actualizar UI inmediatamente para mayor responsividad
      const nuevoCerrada = !estadoActual;
      
      // Actualizar la UI inmediatamente para dar feedback al usuario
      setPuertas(puertas.map(puerta => 
        puerta.id === id ? {...puerta, cerrada: nuevoCerrada} : puerta
      ));
      
      console.log(`Cambiando puerta ${id} a estado: ${nuevoCerrada ? 'cerrada' : 'abierta'}`);
      
      // Enviar petición al servidor
      const respuesta = await toggleDoorState(id, nuevoCerrada);
      console.log('Respuesta del servidor:', respuesta);
      
      // Si el servidor devolvió una respuesta exitosa, actualizar con el valor exacto devuelto
      if (respuesta && respuesta.status === true) {
        // Si el backend devuelve el status actualizado, usarlo
        if (respuesta.data && typeof respuesta.data.cerrada !== 'undefined') {
          setPuertas(puertas.map(puerta => 
            puerta.id === id ? {
              ...puerta, 
              cerrada: respuesta.data.cerrada,
              bloqueada: respuesta.data.cerrada // Mantener bloqueada y cerrada sincronizadas
            } : puerta
          ));
        }
      }
      
    } catch (error) {
      console.error(`Error al cambiar estado de puerta ${id}:`, error);
      
      // Revertir cambio en UI si hay error
      setPuertas(puertas.map(puerta => 
        puerta.id === id ? {...puerta, cerrada: estadoActual} : puerta
      ));
      
      // Mostrar alerta de error
      Alert.alert(
        'Error',
        `No se pudo cambiar el estado de la puerta ${id}. ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Función para mostrar información de depuración de red
  const manejarMostrarDebug = () => {
    showNetworkDebugInfo();
  };

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Control de Puertas</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => showNetworkDebugInfo()}
          >
            <AntDesign name="wifi" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              setRefreshing(true);
              cargarPuertas();
            }}
            disabled={refreshing}
          >
            <AntDesign name="reload1" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>      {/* Título descriptivo en lugar de TabBar */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Puertas disponibles</Text>
        {error && (
          <TouchableOpacity 
            style={styles.errorBanner}
            onPress={() => showNetworkDebugInfo()}
          >
            <AntDesign name="warning" size={18} color="#fff" />
            <Text style={styles.errorMessageText}>Problema de conexión - Toca para diagnóstico</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#43A047" />
          <Text style={styles.loadingText}>Cargando puertas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <AntDesign name="warning" size={50} color="#e53e3e" />
              <Text style={styles.errorText}>{error}</Text>
              
              {/* Botón para reintentar o mostrar depuración de red */}
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={manejarMostrarDebug}
              >
                <Text style={styles.retryButtonText}>Mostrar Depuración de Red</Text>
              </TouchableOpacity>
            </View>
          ) : puertas.length > 0 ? (
            puertas.map((puerta) => (
              <View key={puerta.id} style={styles.puertaCard}>
                <View style={styles.puertaInfo}>
                  <Text style={styles.puertaNombre}>{puerta.nombre}</Text>
                  <Text style={[
                    styles.puertaEstado,
                    puerta.cerrada ? styles.cerrada : styles.abierta
                  ]}>
                    {puerta.cerrada ? 'Cerrada' : 'Abierta'}
                  </Text>
                </View>
                
                <View style={styles.switchContainer}>
                  <Switch
                    value={!puerta.cerrada} // Switch en ON cuando la puerta está abierta
                    onValueChange={() => cambiarEstadoPuerta(puerta.id, puerta.cerrada)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={!puerta.cerrada ? '#43A047' : '#f4f3f4'}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <AntDesign name="inbox" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No hay puertas disponibles</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#43A047',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
  },  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  subtitleContainer: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#334155',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },  errorMessageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    padding: 16,
  },
  puertaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  puertaInfo: {
    flex: 1,
  },
  puertaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  puertaEstado: {
    fontSize: 16,
    fontWeight: '500',
  },
  cerrada: {
    color: '#e53e3e',
  },
  abierta: {
    color: '#43A047',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  switchContainer: {
    marginLeft: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e53e3e',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#43A047',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});