import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import { createStackNavigator } from '@react-navigation/stack';

//llamar screen padre
import ScreenHome from './src/screen/home/ScreenHome';
import ScreenSetting from './src/screen/setting/ScreenSetting';
import ScreenAbout from './src/screen/about/ScreenAbout';

//llamar screen hijo
import HomeDetalles from './src/screen/home/HomeDetalles';
import LucesCasa from './src/screen/home/LucesCasa';
import PuertaCasa from './src/screen/home/PuertaCasa';
import ScreenLogin from './src/screen/login/ScreenLogin';
import ScreenCrearCuenta from './src/screen/login/ScreenCrearCuenta';



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function MyStackHome() {
    return (
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="HomeMain" component={ScreenHome} />
            <Stack.Screen name="HomeDetalles" component={HomeDetalles} />
            <Stack.Screen name="LucesCasa" component={LucesCasa} />
            <Stack.Screen name="PuertaCasa" component={PuertaCasa} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
function MyTabs({ setIsLoggedIn }) {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelPosition: 'beside-icon',
                tabBarStyle: {
                    justifyContent: 'flex-end',
                },
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={MyStackHome} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    ),
                    tabBarLabel: 'Inicio',
                }}
            />
            <Tab.Screen 
                name="About" 
                component={ScreenAbout} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="infocirlceo" size={size} color={color} />
                    ),
                    tabBarLabel: 'Info',
                }}
            />
            <Tab.Screen 
                name="Settings" 
                children={() => <ScreenSetting setIsLoggedIn={setIsLoggedIn} />} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="setting" size={size} color={color} />
                    ),
                    tabBarLabel: 'Ajustes',
                }}
            />
        </Tab.Navigator>
    );
}

function AuthStack({ setIsLoggedIn }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ScreenLogin">
                {props => <ScreenLogin {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="ScreenCrearCuenta" component={ScreenCrearCuenta} />
        </Stack.Navigator>
    );
}

export default function Navegacion() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Mostrar login por defecto

    // Aquí podrías usar contexto o redux para manejar el login real
    // Por ahora, solo muestra el login primero
    return isLoggedIn ? <MyTabs setIsLoggedIn={setIsLoggedIn} /> : <AuthStack setIsLoggedIn={setIsLoggedIn} />;
}