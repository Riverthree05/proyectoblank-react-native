import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { StackNavigationProp } from '@react-navigation/stack';

// Definimos los tipos para la navegación
type RootStackParamList = {
  HomeMain: undefined;
  HomeDetalles: undefined;
  LucesCasa: undefined;
  PuertaCasa: undefined;
};

type ScreenHomeNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ScreenHome() {
  const navigation = useNavigation<ScreenHomeNavigationProp>();
  const [contador, setContador] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Casa Inteligente</Text>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlCard}
          onPress={() => navigation.navigate('LucesCasa')}
        >
          <View style={[styles.iconContainer, styles.lightIcon]}>
            <AntDesign name="bulb1" size={32} color="#fff" />
          </View>
          <Text style={styles.controlTitle}>Luces</Text>
          <Text style={styles.controlDescription}>Controla la iluminación de tu casa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlCard}
          onPress={() => navigation.navigate('PuertaCasa')}
        >
          <View style={[styles.iconContainer, styles.doorIcon]}>
            <AntDesign name="home" size={32} color="#fff" />
          </View>
          <Text style={styles.controlTitle}>Puertas</Text>
          <Text style={styles.controlDescription}>Administra el acceso a tu hogar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.counterContainer}>
        <Text style={styles.counterTitle}>Contador de prueba</Text>
        <Text style={styles.counter}>Valor: {contador}</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <Button title="Sumar" onPress={() => setContador(contador + 1)} color="#1976D2" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Restar" onPress={() => setContador(contador - 1)} color="#D32F2F" />
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('HomeDetalles')}
      >
        <Text style={styles.settingsText}>Ver más opciones</Text>
        <AntDesign name="right" size={16} color="#1976D2" />
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
  controlsContainer: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 24,
  },
  controlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lightIcon: {
    backgroundColor: '#1976D2',
  },
  doorIcon: {
    backgroundColor: '#43A047',
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  controlDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '70%',
  },
  counterContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  counter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  buttonContainer: {
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 120,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  settingsText: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginRight: 8,
  }
})