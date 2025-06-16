import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'

export default function ScreenLogin({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    // Usuario y contraseña estáticos para pruebas
    if (email !== 'usuario@gmail.com' || password !== '123456') {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
      return;
    }
    setIsLoggedIn(true); // Cambia a la pantalla principal
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
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <View style={styles.buttonContainer}>
        <Button title="Ingresar" onPress={handleLogin} color="#1976D2" />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Crear cuenta" onPress={() => (navigation as any).navigate('ScreenCrearCuenta')} color="#43A047" />
      </View>
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
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
})