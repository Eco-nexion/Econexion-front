import { Colors, FontSize, Spacing } from '@constants';
import { useAuth } from '@/src/contexts/AuthContext';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disabled = !isEmailValid(email) || password.trim().length === 0;

    const onSubmit = async () => {
        setError(null);
        if (disabled) {
            setError('Revisa tus datos e inténtalo de nuevo.');
            return;
        }
        const mockResponse = {
            user: {
                id: 'mock-user-id-123',
                enterpriseName: 'Econexion S.A.S.',
                username: 'Juan Pérez',
                nit: '900123456-1',
                email: 'juan.perez@econexion.com',
                rol: 'VENDEDOR',
            },
            token: 'mock-jwt-token-econexion-abc123xyz',
        };

        // Usar el contexto de Auth para login (guarda y redirige automáticamente)
        await login(mockResponse.token, mockResponse.user);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={require('@assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode='contain'
                        accessibilityLabel='Logo de Econexion'
                    />
                    <Text style={styles.title}>Inicia sesión</Text>
                    <Text style={styles.subtitle}>Bienvenido de nuevo a Econexion</Text>
                </View>

                <View style={styles.card}>
                    <View style={{ gap: Spacing.md }}>
                        <View>
                            <Text style={styles.label}>Correo</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder='correo@dominio.com'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                autoComplete='email'
                            />
                        </View>

                        <View>
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder='Tu clave'
                                    secureTextEntry={!showPassword}
                                    autoComplete='password'
                                />
                                <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.showBtn}>
                                    <Text style={styles.showBtnText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Pressable
                            style={[styles.submit, disabled && styles.submitDisabled]}
                            disabled={disabled}
                            onPress={onSubmit}
                            accessibilityRole='button'
                            accessibilityLabel='Confirmar inicio de sesión'
                        >
                            <Text style={styles.submitText}>Entrar</Text>
                        </Pressable>

                        <View style={styles.rowBetween}>
                            <Link href='/register' style={styles.link}>
                                Crear cuenta
                            </Link>
                            <Pressable accessibilityRole='button'>
                                <Text style={styles.linkMuted}>¿Olvidaste tu clave?</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.lightGray },
    container: { flex: 1, padding: Spacing.lg },
    header: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg },
    logo: { width: 96, height: 96, marginBottom: Spacing.md },
    title: { fontSize: 28, fontWeight: '800', color: Colors.ecoGreen },
    subtitle: { marginTop: 4, color: Colors.gray },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    label: { fontSize: FontSize.medium, color: Colors.gray, marginBottom: Spacing.xs },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 10,
        backgroundColor: '#fff',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.medium,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    showBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.ecoGreen,
        backgroundColor: '#fff',
    },
    showBtnText: { color: Colors.ecoGreen, fontWeight: '600' },
    errorBox: {
        backgroundColor: '#FFE8E8',
        borderColor: '#FFBABA',
        borderWidth: 1,
        borderRadius: 10,
        padding: Spacing.sm,
    },
    errorText: { color: '#C00' },
    submit: {
        marginTop: Spacing.sm,
        backgroundColor: Colors.ecoGreen,
        padding: Spacing.md,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitDisabled: { backgroundColor: Colors.gray },
    submitText: { color: '#fff', fontWeight: '700', fontSize: FontSize.medium },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
    link: { color: Colors.cyan, fontWeight: '600' },
    linkMuted: { color: Colors.gray },
});

function isEmailValid(email: string): boolean {
    const e = (email || '').trim();
    if (e.length === 0) {
        return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(e);
}