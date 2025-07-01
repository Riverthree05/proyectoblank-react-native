import { StyleSheet, Text, View, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute, ParamListBase } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack';
import { loginUser, handleApiError } from '../../utils/api';
import { useAuth } from '../../../Navegacion';

// Definir tipos para los parámetros de navegación
type AuthStackParamList = {
  ScreenLogin: { registeredEmail?: string; registeredPassword?: string };
  ScreenCrearCuenta: undefined;
};

type ScreenLoginNavigationProp = StackNavigationProp<AuthStackParamList, 'ScreenLogin'>;

export default function ScreenLogin() {
  const [email, setEmail] = useState('');
  const [pw, setpw] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ScreenLoginNavigationProp>();
  const route = useRoute();
  const { setIsLoggedIn } = useAuth();
  
  // Manejar parámetros de navegación de forma segura
  useEffect(() => {
    const params = route.params as { registeredEmail?: string, registeredPassword?: string } | undefined;
    
    if (params?.registeredEmail) {
      setEmail(params.registeredEmail);
    }
    
    if (params?.registeredPassword) {
      setpw(params.registeredPassword);
    }
  }, [route.params]);

  const onLogin = async () => {
    if (email === '' || pw === '') {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Intentando login con:', { email });
      
      const result = await loginUser({
        email: email,
        pw: pw
      });
      
      console.log('Respuesta login:', result);
      
      if (result && result.status) {
        setIsLoggedIn(true);
        console.log('Login exitoso');
      } else {
        const errorMsg = result?.mensaje || 'Credenciales incorrectas';
        console.error('Error login:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      handleApiError(error, 'inicio de sesión');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
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
        value={pw}
        onChangeText={setpw}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.buttonSecondary]}
        onPress={() => navigation.navigate('ScreenCrearCuenta')}
        disabled={loading}
      >
        <Text style={styles.buttonSecondaryText}>Crear cuenta</Text>
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
    color: '#1976D2',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#1976D2',
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
    backgroundColor: '#1976D2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#bbdefb',
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
    borderColor: '#43A047',
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },  buttonSecondaryText: {
    color: '#43A047',
    fontSize: 18,
    fontWeight: 'bold',
  }
})