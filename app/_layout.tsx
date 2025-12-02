import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext'; // Ajusta path

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name='index' options={{ headerShown: false, title: 'Econexion' }} />
                    <Stack.Screen name="auth" />
                    <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}