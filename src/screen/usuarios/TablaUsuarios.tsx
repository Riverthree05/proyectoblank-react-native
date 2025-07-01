import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import React, { useEffect } from 'react';
import { useUsuarios, UsuariosProvider, Usuario } from '../../context/EstadoGloblaUser';
import AntDesign from '@expo/vector-icons/AntDesign';

// Componente que utiliza el contexto
const TablaUsuariosContent = () => {
  const { usuarios, loading, error, cargarUsuarios, eliminarUsuario } = useUsuarios();
  
  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    console.log('TablaUsuariosContent montado - cargando usuarios');
    cargarUsuarios().catch(err => 
      console.error('Error al cargar usuarios en TablaUsuariosContent:', err)
    );
  }, []);

  // Función para renderizar cada elemento de usuario
  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre || 'Sin nombre'}</Text>
        <Text style={styles.userEmail}>{item.email || 'Sin email'}</Text>
        <Text style={[
          styles.userStatus, 
          {color: item.status === 'activo' ? '#43A047' : '#F44336'}
        ]}>
          {item.status || 'desconocido'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => eliminarUsuario(item.id, item.nombre)}
      >
        <AntDesign name="delete" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  // Si está cargando, mostrar indicador
  if (loading && usuarios.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#43A047" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  // Si hay error y no hay datos, mostrar mensaje
  if (error && usuarios.length === 0) {
    return (
      <View style={styles.centered}>
        <AntDesign name="exclamationcircle" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={cargarUsuarios}
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios || []}
        renderItem={renderUsuario}
        keyExtractor={(item) => item && item.id ? item.id.toString() : Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={cargarUsuarios}
            colors={['#43A047']}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lista de Usuarios</Text>
            <Text style={styles.headerCount}>{usuarios.length} usuarios encontrados</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <AntDesign name="inbox" size={50} color="#BDBDBD" />
            <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
          </View>
        )}
      />
    </View>
  );
};

// Componente que provee el contexto
export default function TablaUsuarios() {
  return (
    <UsuariosProvider>
      <TablaUsuariosContent />
    </UsuariosProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  header: {
    marginBottom: 15,
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerCount: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  userStatus: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#43A047',
    borderRadius: 5,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  }
});