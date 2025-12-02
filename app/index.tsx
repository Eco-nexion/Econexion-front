import { Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import { AuthService } from '@/src/services/authService';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthParams {
    access_token?: string;
    token_type?: string;
    expires_in?: string;
    scope?: string;
}

export default function Home() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [isExchanging, setIsExchanging] = useState(false);

    const redirectUri = makeRedirectUri();
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: iosClientId,
        androidClientId: androidClientId,
        clientId: clientId,
        responseType: 'token',
        scopes: ['openid', 'email', 'profile'],
        redirectUri,
        // biome-ignore lint/style/useNamingConvention: <is PKCE>
        usePKCE: false,
        selectAccount: true,
    });

    useEffect(() => {
        if (!response) {
            return;
        }

        if (response.type === 'success') {
            setIsExchanging(false);
            setAuthError(null);

            const auth = response.authentication;
            const accessToken = auth?.accessToken ?? (response.params as GoogleAuthParams)?.access_token;

            if (!accessToken) {
                setAuthError('No se recibió access_token. Revisa la configuración de OAuth.');
                return;
            }

            console.log(accessToken);

            // Placeholder para call real a backend /auth/google (agrega en backend)
            // try {
            //     const backendResponse = await apiClient.post('/auth/google', { access_token: accessToken });
            //     // Almacena como en AuthService
            //     await storage.setItem(STORAGE_KEYS.token, backendResponse.data.token);
            //     // ... resto
            //     // Redirigir basado en role
            //     if (backendResponse.data.user.role === 'GENERATOR') {
            //         router.replace('/(dashboard)');
            //     } else {
            //         router.replace('/(dashboard)/search');
            //     }
            // } catch (err) {
            //     setAuthError('Error en auth con backend');
            // }

            // MOCK ANTERIOR: Mantengo por ahora hasta implementar /auth/google en backend

            // mocking the exchange process
            const mockResponse = {
                user: {
                    id: 'mock-user-id-123',
                    email: 'Google@example.com',
                    name: 'Google Mock',
                    role: 'RECYCLER', // Ajustado a enum backend
                },
                token: 'mock-jwt-token-google-abc123xyz',
            };

            // Simular delay de red
            setTimeout(async () => {
                console.log('Mock response:', mockResponse);
                await storage.setItem(STORAGE_KEYS.token, mockResponse.token);
                await storage.setItem(STORAGE_KEYS.user_name, mockResponse.user.name);
                await storage.setItem(STORAGE_KEYS.user_email, mockResponse.user.email);
                await storage.setItem(STORAGE_KEYS.user_type, mockResponse.user.role);
                if (mockResponse.user.role === 'GENERATOR') {
                    router.replace('/dashboard');
                } else {
                    router.replace('/dashboard/search');
                }
            }, 1000);
        } else if (response.type === 'error') {
            setIsExchanging(false);
            console.error('OAuth error:', response.error);
            setAuthError(`Error en la autorización: ${response.error?.message || 'Desconocido'}`);
        } else if (response.type === 'cancel') {
            setIsExchanging(false);
            setAuthError('Autenticación cancelada');
        } else if (response.type === 'dismiss') {
            setIsExchanging(false);
        }
    }, [response]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.brandSection}>
                    <Image
                        source={require('@assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode='contain'
                        accessibilityLabel='Econexion logo'
                    />
                    <Text style={styles.title}>Econexion</Text>
                </View>

                <View style={styles.footerPlaceholder}>
                    <Pressable
                        style={[styles.googleButton, isExchanging || !request ? { opacity: 0.6 } : null]}
                        onPress={() => {
                            setAuthError(null);
                            setIsExchanging(true);
                            console.log('Iniciando OAuth...');
                            promptAsync({ showInRecents: true }).catch((error) => {
                                console.error('Error al abrir OAuth:', error);
                                setIsExchanging(false);
                                setAuthError('No se pudo iniciar el proceso de autenticación');
                            });
                        }}
                        disabled={isExchanging || !request}
                        accessibilityRole='button'
                        accessibilityLabel='Iniciar sesión con Google'
                    >
                        <Image
                            source={{
                                uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
                            }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleText}>{isExchanging ? 'Conectando' : 'Continuar con Google'}</Text>
                    </Pressable>

                    <Link href='/auth/login' asChild>
                        <Pressable style={styles.econexionButton}>
                            <Text style={styles.econexionButtonText}>♻️ Iniciar con Econexion</Text>
                        </Pressable>
                    </Link>

                    {authError ? <Text style={{ color: '#C00' }}>{authError}</Text> : null}

                    <Link href='/auth/register' asChild>
                        <Pressable style={styles.ctaButton}>
                            <Text style={styles.ctaButtonText}>Ir al registro</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    container: {
        flex: 1,
        padding: Spacing.lg,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    logo: {
        width: 160,
        height: 160,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.ecoGreen,
        letterSpacing: 0.5,
    },
    footerPlaceholder: {
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.gray,
        backgroundColor: '#FFFFFFAA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    googleButton: {
        width: '75%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Colors.gray,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    googleText: {
        color: '#000',
        fontSize: FontSize.medium,
        fontWeight: '500',
    },
    econexionButton: {
        width: '75%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Colors.gray,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    econexionButtonText: {
        color: '#000',
        fontSize: FontSize.medium,
        fontWeight: '600',
    },
    ctaButton: {
        backgroundColor: Colors.ecoGreen,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: 10,
    },
    ctaButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: FontSize.medium,
    },
});
