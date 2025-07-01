import { StyleSheet, Text, View, TouchableOpacity, Button, Alert } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../.././../Navegacion';

export default function ScreenSetting() {
  const { setIsLoggedIn } = useAuth();
  const navigation = useNavigation();
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión', 
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            // Limpiar cualquier información de sesión si la hay
            // Por ejemplo: AsyncStorage.removeItem('token');
            
            // Actualizar el estado global de autenticación
            setIsLoggedIn(false);
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <AntDesign name="logout" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#1976D2',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 10
  }
})