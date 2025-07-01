import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Alert, 
  ActivityIndicator, 
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { apiRequest } from '../utils/api';
import AntDesign from '@expo/vector-icons/AntDesign';

// Definir el tipo para un usuario
export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  status: string;
};

// Definir el tipo para el contexto
type UsuariosContextType = {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  cargarUsuarios: () => Promise<void>;
  eliminarUsuario: (id: number, nombre: string) => Promise<void>;
};

// Crear el contexto
const UsuariosContext = createContext<UsuariosContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useUsuarios = () => {
  const context = useContext(UsuariosContext);
  if (context === undefined) {
    throw new Error('useUsuarios debe ser usado dentro de un UsuariosProvider');
  }
  return context;
};

// Proveedor del contexto
export const UsuariosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios al iniciar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cargar la lista de usuarios
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utilizamos apiRequest para manejar la URL base correctamente
      const response = await apiRequest("/api/usuario", {
        method: "GET"
      });
      
      console.log('Resultado de API:', response);
          
      if (response && response.body) {
        // La respuesta puede estar en distintos formatos
        const users = Array.isArray(response.body) 
          ? response.body 
          : (response.body.data || response.body);
          
        setUsuarios(users);
        console.log('Usuarios cargados:', users.length);
      } else {
        setError('No se pudieron cargar los usuarios');
        console.log('Respuesta inválida:', response);
      }
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un usuario
  const eliminarUsuario = async (id: number, nombre: string) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Estás seguro que deseas eliminar a ${nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await apiRequest("/api/usuario/eliminar", {
                method: "POST",
                body: JSON.stringify({ id })
              });
              
              // La respuesta ya viene parseada como JSON desde apiRequest
              const result = response;
              
              if (result && !result.error) {
                Alert.alert("Éxito", `Usuario ${nombre} eliminado correctamente`);
                // Actualizar la lista de usuarios
                cargarUsuarios();
              } else {
                Alert.alert(
                  "Error", 
                  `No se pudo eliminar el usuario: ${result?.mensaje || 'Error desconocido'}`
                );
                setLoading(false);
              }
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              Alert.alert("Error", "No se pudo eliminar el usuario");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const value = {
    usuarios,
    loading,
    error,
    cargarUsuarios,
    eliminarUsuario
  };

  return (
    <UsuariosContext.Provider value={value}>
      {children}
    </UsuariosContext.Provider>
  );
};

// Componente de Tabla de Usuarios
const TablaUsuarios = () => {
  const { usuarios, loading, error, cargarUsuarios, eliminarUsuario } = useUsuarios();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarUsuarios();
    setRefreshing(false);
  };

  // Renderizar cada fila de usuario
  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: item.status === 'activo' ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.userStatus}>{item.status}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => eliminarUsuario(item.id, item.nombre)}
      >
        <AntDesign name="delete" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  // Si está cargando, mostrar indicador
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarUsuarios}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      
      {usuarios.length > 0 ? (
        <FlatList
          data={usuarios}
          renderItem={renderUsuario}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <View style={styles.noUsersContainer}>
          <Text style={styles.noUsersText}>No hay usuarios disponibles</Text>
        </View>
      )}
    </View>
  );
};

// Componente principal que envuelve la tabla con el provider
export default function EstadoGloblaUser() {
  return (
    <UsuariosProvider>
      <TablaUsuarios />
    </UsuariosProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#2c3e50'
  },
  listContent: {
    paddingBottom: 20
  },
  userRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e'
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  userStatus: {
    fontSize: 12,
    color: '#95a5a6',
    textTransform: 'capitalize'
  },
  deleteButton: {
    padding: 10
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noUsersText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center'
  }
});