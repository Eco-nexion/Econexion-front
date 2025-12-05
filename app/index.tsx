import { useAuth } from '@/src/contexts/AuthContext';
import { API_CONFIG, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthParams {
    access_token?: string;
    id_token?: string;
    token_type?: string;
    expires_in?: string;
    scope?: string;
}

export default function Home() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [authError, setAuthError] = useState<string | null>(null);
    const [isExchanging, setIsExchanging] = useState(false);

    // 🔧 FIX: Usar proxy de Expo (más confiable y consistente)
    const redirectUri = makeRedirectUri({
        useProxy: true,
    });

    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

    // 🔍 DEBUG: Log de configuración OAuth al montar
    useEffect(() => {
        console.group('🔧 Google OAuth Configuration Debug');
        console.log('🔗 Redirect URI (USANDO PROXY):', redirectUri);
        console.log('🌐 Web Client ID:', clientId ? `${clientId.substring(0, 30)}...` : '❌ NO CONFIGURADO');
        console.log(
            '🍎 iOS Client ID:',
            iosClientId === 'your-ios-client-id'
                ? '⚠️ PLACEHOLDER - No afecta Expo Go'
                : iosClientId
                  ? `${iosClientId.substring(0, 20)}...`
                  : '❌ NO CONFIGURADO'
        );
        console.log(
            '🤖 Android Client ID:',
            androidClientId ? `${androidClientId.substring(0, 30)}...` : '❌ NO CONFIGURADO'
        );
        console.log('\n📋 ACCIÓN INMEDIATA - Registra ESTE URI en Google Cloud Console:');
        console.log('   ✅ ' + redirectUri + ' ← COPIA Y REGISTRA ESTE');
        console.log('\n🔗 Pasos:');
        console.log('   1. Ve a: https://console.cloud.google.com/apis/credentials');
        console.log('   2. Edita tu OAuth 2.0 Client ID (Web)');
        console.log('   3. En "Authorized redirect URIs", haz click "+ ADD URI"');
        console.log('   4. Pega exactamente: ' + redirectUri);
        console.log('   5. Guarda y ESPERA 5-10 minutos');
        console.log('\n⚠️ IMPORTANTE: El URI debe ser EXACTAMENTE como aparece arriba');
        console.groupEnd();
    }, [redirectUri, clientId, iosClientId, androidClientId]);

    const [request, response, promptAsync] = Google.useAuthRequest({
        // 🔧 FIX: clientId funciona para todas las plataformas incluyendo Expo Go
        clientId: clientId,
        iosClientId: iosClientId !== 'your-ios-client-id' ? iosClientId : undefined,
        androidClientId: androidClientId,
        responseType: 'id_token token',
        scopes: ['openid', 'email', 'profile'],
        redirectUri, // Usar el redirectUri configurado con scheme
        // biome-ignore lint/style/useNamingConvention: <is PKCE>
        usePKCE: false,
        selectAccount: true,
        extraParams: {
            nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        },
    });

    useEffect(() => {
        if (!response) return;

        // 🔍 DEBUG: Log completo de la respuesta OAuth
        console.group('📡 Google OAuth Response');
        console.log('Response Type:', response.type);

        if (response.type === 'error') {
            console.error('❌ OAuth Error Details:', {
                error: response.error,
                params: response.params,
                url: response.url,
            });
            console.error('🔗 Failed Redirect URI:', redirectUri);
            console.error('\n⚠️ ACCIÓN REQUERIDA:');
            console.error('   1. Ve a: https://console.cloud.google.com/apis/credentials');
            console.error('   2. Edita tu OAuth 2.0 Client ID');
            console.error('   3. En "Authorized redirect URIs", agrega exactamente:');
            console.error('      ' + redirectUri);
            console.error('   4. Guarda y espera 5-10 minutos');
            console.groupEnd();
        }

        if (response.type !== 'success') {
            // Manejar errores inmediatamente
            setIsExchanging(false);
            if (response.type === 'error') {
                setAuthError('Error en Google OAuth');
            }
            return;
        }

        // Usuario completó OAuth exitosamente
        const auth = response.authentication;
        const idToken = auth?.idToken ?? (response.params as GoogleAuthParams)?.id_token;

        if (!idToken) {
            setAuthError('No se recibió token de Google');
            setIsExchanging(false);
            return;
        }

        // Guardar y autenticar
        console.log('🔑 Token de Google recibido');
        console.log('🔍 idToken de Google COMPLETO:', idToken);
        console.log('📏 Longitud del idToken:', idToken.length);
        console.log('🎯 Primeros 50 caracteres:', idToken.substring(0, 50));

        // Primero guardar el idToken de Google temporalmente
        storage
            .setItem(STORAGE_KEYS.token, idToken)
            .then(() => {
                console.log('📡 Enviando idToken de Google al backend...');
                return fetch(`${API_CONFIG.BASE_URL}/api/auth/login/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: idToken }),
                });
            })
            .then((loginRes) => {
                console.log('📡 Status:', loginRes.status);

                if (loginRes.status === 401) {
                    // Usuario no registrado - redirigir a registro
                    console.log('➡️ Usuario no registrado (401), ir a registro');
                    setIsExchanging(false);
                    router.push('/register');
                    return null;
                }

                if (!loginRes.ok) {
                    // Otro error - mostrar notificación
                    throw new Error(`Error ${loginRes.status}: Error al autenticar con Google`);
                }

                return loginRes.json();
            })
            .then((loginData) => {
                if (!loginData) return null;

                console.log('✅ Respuesta de /login/google:', {
                    hasJwt: !!loginData.jwt,
                    hasToken: !!loginData.token,
                    hasEmail: !!loginData.email,
                    keys: Object.keys(loginData),
                });

                // IMPORTANTE: Guardar el JWT del backend (no el idToken de Google)
                const backendJwt = loginData.jwt || loginData.token;
                if (backendJwt) {
                    console.log('💾 Guardando JWT del backend...');
                    return storage.setItem(STORAGE_KEYS.token, backendJwt).then(() => loginData);
                }

                console.warn('⚠️ Backend no devolvió JWT');
                return loginData;
            })
            .then((loginData) => {
                if (!loginData) return null;

                console.log('✅ Buscando datos del usuario:', loginData.email);
                return fetch(`${API_CONFIG.BASE_URL}/lab/users/exists/${encodeURIComponent(loginData.email)}`);
            })
            .then((userRes) => {
                if (!(userRes && userRes.ok)) {
                    if (!userRes) return null;
                    throw new Error(`Error al obtener datos del usuario (${userRes.status})`);
                }
                return userRes.json();
            })
            .then((userData) => {
                if (!userData) return;

                // Guardar TODO
                return Promise.all([
                    storage.setItem(STORAGE_KEYS.user_id, userData.id),
                    storage.setItem(STORAGE_KEYS.user_enterprise_name, userData.enterpriseName),
                    storage.setItem(STORAGE_KEYS.user_username, userData.username),
                    storage.setItem(STORAGE_KEYS.user_nit, userData.nit || ''),
                    storage.setItem(STORAGE_KEYS.user_email, userData.email),
                    storage.setItem(STORAGE_KEYS.user_rol, userData.rol),
                ])
                    .then(() => {
                        console.log('✅ Guardado, refrescando auth...');
                        return refreshAuth();
                    })
                    .then(() => {
                        console.log('✅ Auth refrescado, navegando');
                        setIsExchanging(false);
                        router.replace('/(tabs)/home');
                    });
            })
            .catch((error) => {
                console.error('❌ Error:', error);
                setAuthError('Error al autenticar');
                setIsExchanging(false);
            });
    }, [response, router]);

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
                            console.log('🖱️ Click en botón Google');
                            console.log('📊 Estado actual - isExchanging:', isExchanging, 'request:', !!request);

                            setAuthError(null);
                            setIsExchanging(true);

                            console.log('🚀 Llamando promptAsync...');

                            promptAsync({ showInRecents: true })
                                .then(() => {
                                    console.log('✅ promptAsync completado');
                                })
                                .catch((error) => {
                                    console.error('❌ Error en promptAsync:', error);
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

                    <Link href='/login' asChild>
                        <Pressable style={styles.econexionButton}>
                            <Text style={styles.econexionButtonText}>♻️ Iniciar con Econexion</Text>
                        </Pressable>
                    </Link>

                    {authError ? <Text style={{ color: '#C00' }}>{authError}</Text> : null}

                    <Link href='/register' asChild>
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
        backgroundColor: '#dddddd',
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
