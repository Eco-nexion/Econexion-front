import { Colors, FontSize, Spacing } from '@constants';
import { useAuth } from '@/src/contexts/AuthContext'; // Asegura import correcto
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const router = useRouter();
    const { signIn, user, loading: authLoading } = useAuth(); // Nuevo: Usa loading del context    const [email, setEmail] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);  // Nuevo: Modal para error
    const [errorMessage, setErrorMessage] = useState('');

    const disabled = !isEmailValid(email) || password.trim().length === 0;

    const onSubmit = async () => {
        if (disabled) {
            setErrorMessage('Revisa tus datos e inténtalo de nuevo.');
            setShowErrorModal(true);
            return;
        }

        const result = await signIn(email, password);
        if (!result.success) {
            setErrorMessage(result.error || 'Error desconocido');
            setShowErrorModal(true);
        }
        // Redirección se maneja en useEffect (post-user update)
    };

    // Redirige post-login basado en role
    useEffect(() => {
        if (user) {
            if (user.role === 'GENERATOR') {
                router.replace('/dashboard');
            } else if (user.role === 'RECYCLER') {
                router.replace('/dashboard/search');
            }
        }
    }, [user]);

    // Nuevo: Manejo de loading/user para evitar render del form si ya autenticado
    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.ecoGreen} />
            </View>
        );
    }

    if (user) {
        // No renderiza nada; useEffect redirigirá inmediatamente
        return null;
    }

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
                            <Link href='/auth/register' style={styles.link}>
                                Crear cuenta
                            </Link>
                            <Pressable accessibilityRole='button'>
                                <Text style={styles.linkMuted}>¿Olvidaste tu clave?</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>

            {/* Nuevo: Modal para error (coherente con register) */}
            <Modal
                visible={showErrorModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowErrorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Error</Text>
                        <Text style={styles.modalMessage}>{errorMessage}</Text>
                        <Pressable
                            style={styles.modalButton}
                            onPress={() => setShowErrorModal(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Estilos para modal (copiados de register para coherencia)
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: Spacing.lg,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#C00',  // Rojo para error
        marginBottom: Spacing.sm,
    },
    modalMessage: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    modalButton: {
        backgroundColor: Colors.ecoGreen,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: FontSize.medium,
    },
});

function isEmailValid(email: string): boolean {
    const e = (email || '').trim();
    if (e.length === 0) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(e);
}