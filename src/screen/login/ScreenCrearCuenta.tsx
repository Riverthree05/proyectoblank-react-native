import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, StackActions } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack';
import { registerUser, handleApiError } from '../../utils/api'

// Definir tipos para los parámetros de navegación
type AuthStackParamList = {
  ScreenLogin: { registeredEmail?: string; registeredPassword?: string };
  ScreenCrearCuenta: undefined;
};

type ScreenCrearCuentaNavigationProp = StackNavigationProp<AuthStackParamList, 'ScreenCrearCuenta'>;

export default function ScreenCrearCuenta() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ScreenCrearCuentaNavigationProp>();
  const [status] = useState('activo'); // Estado por defecto para usuarios nuevos

  const onCrearCuenta = async () => {
    // Validaciones de entrada
    if (!email || !password || !confirmPassword || !nombre) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    // Validar formato de email básico
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Introduce un correo electrónico válido');
      return;
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const nuevoUsuario = {
      nombre: nombre,
      email: email,
      pw: password,
      status: status
    };
    
    setLoading(true);
    
    try {
      console.log('Registrando usuario en la API:', nuevoUsuario);
      
      const result = await registerUser(nuevoUsuario);
      
      console.log('Respuesta registro:', result);
      
      if (result && result.status) {
        // Usuario creado exitosamente
        Alert.alert(
          'Usuario Creado', 
          `La cuenta para ${nombre} ha sido creada exitosamente.`, 
          [{ 
            text: 'Iniciar Sesión', 
            onPress: () => {
              navigation.navigate('ScreenLogin', {
                registeredEmail: email,
                registeredPassword: password
              });
            } 
          }]
        );
      } else {
        // Error en la API
        const errorMsg = result?.mensaje || 'Error al crear la cuenta';
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      handleApiError(error, 'registro de usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onCrearCuenta}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Crear Cuenta</Text>
        ) }
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.buttonSecondary]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.buttonSecondaryText}>Volver al Login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#43A047',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#43A047',
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#43A047',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderColor: '#1976D2',
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#1976D2',
    fontSize: 18,
    fontWeight: 'bold',
  },
})