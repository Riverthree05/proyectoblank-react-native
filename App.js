import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navegacion from './Navegacion';
import Constants from 'expo-constants';
import { API_URL, DB_CONFIG } from './src/utils/apiConfig';

// Configuración para ignorar advertencias específicas que pueden aparecer por la configuración de URL
LogBox.ignoreLogs([
  'Setting a timer',
  'Text strings must be rendered within a <Text> component',
]);

export default function App() {
  // Mostrar información de configuración en consola para verificar
  useEffect(() => {
    // Mostrar URL de la API
    console.log('URL de la API:', API_URL);
    
    // Mostrar configuración de base de datos (ocultando la contraseña por seguridad)
    console.log('Configuración MySQL:', {
      ...DB_CONFIG,
      password: DB_CONFIG.password ? '********' : '(ninguna)'
    });
    
    console.log('Intentando conectar a MySQL con:', {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database
    });
  }, []);

  return (
  <NavigationContainer>
    <Navegacion/>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
});
