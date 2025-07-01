import React, { createContext, useContext } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import { createStackNavigator } from '@react-navigation/stack';

//llamar screen padre
import ScreenHome from './src/screen/home/ScreenHome';
import ScreenSetting from './src/screen/setting/ScreenSetting';
import ScreenAbout from './src/screen/about/ScreenAbout';
import TablaUsuarios from './src/screen/usuarios/TablaUsuarios';

//llamar screen hijo
import HomeDetalles from './src/screen/home/HomeDetalles';
import LucesCasa from './src/screen/home/LucesCasa';
import PuertaCasa from './src/screen/home/PuertaCasa';
import ScreenLogin from './src/screen/login/ScreenLogin';
import ScreenCrearCuenta from './src/screen/login/ScreenCrearCuenta';

// Crear contexto de autenticación
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MyStackHome() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                options={{ 
                    headerShown: false 
                }} 
                name="HomeMain" 
                component={ScreenHome} 
            />
            <Stack.Screen 
                name="HomeDetalles" 
                component={HomeDetalles} 
                options={{
                    title: 'Detalles',
                    headerTitle: () => <Text style={{fontSize: 18, fontWeight: 'bold'}}>Detalles</Text>
                }}
            />
            <Stack.Screen 
                name="LucesCasa" 
                component={LucesCasa} 
                options={{
                    title: 'Control de Luces',
                    headerTitle: () => <Text style={{fontSize: 18, fontWeight: 'bold'}}>Control de Luces</Text>
                }}
            />
            <Stack.Screen 
                name="PuertaCasa" 
                component={PuertaCasa} 
                options={{ headerShown: false }} 
            />
        </Stack.Navigator>
    );
}

function SettingsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="SettingsMain" 
                options={{ headerShown: false }} 
                component={ScreenSetting}
            />
        </Stack.Navigator>
    );
}

function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelPosition: 'beside-icon',
                tabBarStyle: {
                    justifyContent: 'flex-end',
                },
                headerTitleAlign: 'center',
                // Aseguramos que todos los labels se muestran correctamente
                tabBarLabel: ({ color, focused }) => (
                    <Text style={{ color }}>
                        {/* No añadimos texto aquí, se maneja en las opciones de cada tab */}
                    </Text>
                ),
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={MyStackHome} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    ),
                    tabBarLabel: ({ color, focused }) => (
                        <Text style={{ color }}>Inicio</Text>
                    ),
                }}
            />
             <Tab.Screen 
                name="Usuarios" 
                component={TablaUsuarios} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="user" size={size} color={color} />
                    ),
                    tabBarLabel: ({ color, focused }) => (
                        <Text style={{ color }}>Usuarios</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="About" 
                component={ScreenAbout} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="infocirlceo" size={size} color={color} />
                    ),
                    tabBarLabel: ({ color, focused }) => (
                        <Text style={{ color }}>Info</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="setting" size={size} color={color} />
                    ),
                    tabBarLabel: ({ color, focused }) => (
                        <Text style={{ color }}>Ajustes</Text>
                    ),
                    headerShown: false,
                }}
            />
            
            
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ScreenLogin" 
                component={ScreenLogin}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ScreenCrearCuenta" 
                component={ScreenCrearCuenta} 
                options={{ 
                    headerShown: true,
                    headerTitle: () => <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>Crear Cuenta</Text>,
                    headerStyle: {
                        backgroundColor: '#43A047',
                    },
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    );
}

export default function Navegacion() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Mostrar login por defecto

    // Proporcionar el contexto de autenticación a toda la aplicación
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {isLoggedIn ? <MyTabs /> : <AuthStack />}
        </AuthContext.Provider>
    );
}