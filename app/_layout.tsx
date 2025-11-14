import { AuthProvider } from '@/src/contexts/AuthContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Stack>
                    <Stack.Screen
                        name='index'
                        options={{
                            headerShown: false,
                            title: 'Econexion',
                        }}
                    />
                    <Stack.Screen
                        name='login'
                        options={{
                            headerShown: false,
                            title: 'Iniciar Sesión',
                        }}
                    />
                    <Stack.Screen
                        name='register'
                        options={{
                            headerShown: false,
                            title: 'Registro',
                        }}
                    />
                    <Stack.Screen
                        name='(tabs)'
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
