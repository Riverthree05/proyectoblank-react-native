import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getAllLights, toggleLight, showNetworkDebugInfo } from '../../utils/api';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function LucesCasa() {
  const [luces, setLuces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  
  // Cargar el estado inicial de las luces
  useEffect(() => {
    cargarLuces();
  }, []);
  
  // Función para cargar el estado de las luces
  const cargarLuces = async () => {
    try {
      setLoading(true);
      setError(null);
      const respuesta = await getAllLights();
      if (respuesta && respuesta.status) {
        setLuces(respuesta.data || []);
      } else {
        // Datos de ejemplo si no hay respuesta del servidor
        const lucesEjemplo = [
          { id: 1, nombre: 'Luz Sala Principal', estado: true },
          { id: 2, nombre: 'Luz Auxiliar Sala', estado: false },
          { id: 3, nombre: 'Luz Cocina Central', estado: true },
          { id: 4, nombre: 'Luz Encimera', estado: false },
          { id: 5, nombre: 'Luz Principal Dormitorio', estado: true },
          { id: 6, nombre: 'Luz de Noche', estado: true },
          { id: 7, nombre: 'Luz Baño', estado: false },
          { id: 8, nombre: 'Luz Exterior', estado: true },
        ];
        
        setLuces(lucesEjemplo);
      }
    } catch (error) {
      console.error('Error al cargar luces:', error);
      setError(error.message);
      // Datos de ejemplo en caso de error
      const lucesEjemplo = [
        { id: 1, nombre: 'Luz Sala Principal', estado: true },
        { id: 2, nombre: 'Luz Cocina Principal', estado: false },
      ];
      
      setLuces(lucesEjemplo);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // No necesitamos filtrar las luces
  // Función para cambiar el estado de una luz
  const cambiarEstadoLuz = async (id, estadoActual) => {
    try {
      // Actualizar UI inmediatamente para mayor responsividad
      const nuevoEstado = !estadoActual;
      
      // Actualizar la UI inmediatamente para dar feedback al usuario
      setLuces(luces.map(luz => 
        luz.id === id ? {...luz, estado: nuevoEstado} : luz
      ));
      
      console.log(`Cambiando luz ${id} a estado: ${nuevoEstado ? 'encendido' : 'apagado'}`);
      
      // Enviar petición al servidor
      const respuesta = await toggleLight(id, nuevoEstado);
      console.log('Respuesta del servidor:', respuesta);
      
      // Si el servidor devolvió una respuesta exitosa, actualizar con el valor exacto devuelto
      if (respuesta && respuesta.status === true) {
        // Si el backend devuelve el status actualizado, usarlo
        if (respuesta.data && typeof respuesta.data.estado !== 'undefined') {
          setLuces(luces.map(luz => 
            luz.id === id ? {...luz, estado: respuesta.data.estado} : luz
          ));
        }
      }
      
    } catch (error) {
      console.error(`Error al cambiar estado de luz ${id}:`, error);
      
      // Revertir cambio en UI si hay error
      setLuces(luces.map(luz => 
        luz.id === id ? {...luz, estado: estadoActual} : luz
      ));
      
      // Mostrar alerta de error
      Alert.alert(
        'Error',
        `No se pudo cambiar el estado de la luz ${id}. ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Control de Luces</Text>
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
              cargarLuces();
            }}
            disabled={refreshing}
          >
            <AntDesign name="reload1" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>      {/* Título descriptivo en lugar de TabBar */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Luces disponibles</Text>
        {error && (
          <TouchableOpacity 
            style={styles.errorBanner}
            onPress={() => showNetworkDebugInfo()}
          >
            <AntDesign name="warning" size={18} color="#fff" />
            <Text style={styles.errorText}>Problema de conexión - Toca para diagnóstico</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Cargando luces...</Text>
        </View>
      ) : (        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {luces.length > 0 ? (
            luces.map((luz) => (
              <View key={luz.id} style={styles.luzCard}>
                <View style={styles.luzInfo}>
                  <Text style={styles.luzNombre}>{luz.nombre}</Text>                  <Text style={[
                    styles.luzEstado,
                    luz.estado ? styles.luzEncendida : styles.luzApagada
                  ]}>
                    {luz.estado ? 'Encendida' : 'Apagada'}
                  </Text>
                </View>
                
                <View style={styles.switchContainer}>
                  <Switch
                    value={luz.estado}
                    onValueChange={() => cambiarEstadoLuz(luz.id, luz.estado)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={luz.estado ? '#1976D2' : '#f4f3f4'}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <AntDesign name="inbox" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No hay luces en esta ubicación</Text>
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
    backgroundColor: '#1976D2',
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
  luzCard: {
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
  luzInfo: {
    flex: 1,
  },
  luzNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  luzEstado: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  luzBrillo: {
    fontSize: 14,
    color: '#666',
  },
  switchContainer: {
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  luzEncendida: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  luzApagada: {
    color: '#888',
  }
})