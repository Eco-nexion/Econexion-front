import { SuccessModal } from '@/src/components';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/authService';
import { API_CONFIG, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import type { RegisterForm, RegisterFormErrors, Role } from '@type/forms';
import { storage } from '@utils';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const roles: { label: string; value: Role }[] = [
    { label: 'Comprador', value: 'BUYER' },
    { label: 'Vendedor', value: 'SELLER' },
];

const decodeIdToken = (token: string) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Token inválido');
        }
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (err) {
        console.error('Error decodificando ID Token:', err);
        return null;
    }
};

export default function Register() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isGoogleFlow = params.google === 'true'; // Detectar si venimos de Google
    
    const { refreshAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [form, setForm] = useState<RegisterForm>({
        enterpriseName: '',
        nit: '',
        username: '',
        email: '',
        role: 'BUYER',
        password: '', // Campo opcional agregado
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({});

    const collectErrors = useCallback((f: RegisterForm): RegisterFormErrors => {
        const e: RegisterFormErrors = {};
        if (!f.enterpriseName.trim()) {
            e.enterpriseName = 'Requerido';
        }
        if (!f.username.trim()) {
            e.username = 'Requerido';
        }
        if (f.email && !f.email.includes('@')) {
            e.email = 'Correo inválido';
        }
        if (!isGoogleFlow && (!f.password || f.password.length < 6)) {
            e.password = 'Mínimo 6 caracteres';
        }
        return e;
    }, [isGoogleFlow]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (isGoogleFlow) {
                // Lógica existente para Google
                try {
                    const idToken = await storage.getItem(STORAGE_KEYS.token);
                    if (!idToken) {
                        setTokenError('No se encontró token de Google');
                        return;
                    }

                    const userData = decodeIdToken(idToken);
                    if (!userData) {
                        setTokenError('Token inválido');
                        return;
                    }

                    const newForm = {
                        enterpriseName: '',
                        nit: '',
                        username: userData.name || '',
                        email: userData.email || '',
                        role: 'BUYER' as Role,
                    };
                    setForm(newForm);
                    setErrors(collectErrors(newForm));
                } catch (error) {
                    console.error('Error cargando datos:', error);
                    setTokenError('Error al cargar tus datos');
                }
            } else {
                // Flujo normal: Limpiar o dejar vacío (ya está inicializado)
                console.log('📝 Modo registro normal activado');
            }
        };
        loadInitialData();
    }, [collectErrors, isGoogleFlow]);

    const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
        const next = { ...form, [key]: value };
        setForm(next);
        setErrors(collectErrors(next));
    };

    const isSubmitDisabled = () => {
        return (
            !(form.enterpriseName.trim() && form.username.trim() && form.email.trim()) ||
            Object.keys(errors).length > 0 ||
            loading
        );
    };

    const onSubmit = async () => {
        setLoading(true);
        try {
            if (isGoogleFlow) {
                 // 1. Registrar usuario con Google
                const idToken = await storage.getItem(STORAGE_KEYS.token);
                if (!idToken) throw new Error('No hay token de Google');
                
                await authService.registerWithGoogle(form, idToken);
                 // El servicio ya devuelve la respuesta, asumimos éxito si no lanza error
                 // Si el backend devuelve JWT en este endpoint, authService debería retornarlo
                 // Por ahora mantenemos la lógica de usar el idToken como fallback o manejarlo en SuccessModal
            } else {
                // 2. Registro Normal
                console.log('📝 Enviando registro normal...');
                await authService.register(form);
                // El registro normal NO devuelve token utilizable para sesión en este endpoint específico según requerimiento
                // Se redirige a login
            }
            
            // 3. Mostrar modal de éxito para ambos casos
            setShowSuccessModal(true);
        } catch (error: unknown) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (tokenError) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>⚠️ {tokenError}</Text>
                        <Link href='/' style={styles.errorLink}>
                            Volver al inicio
                        </Link>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <Text style={styles.header}>Completa tu registro</Text>

                <Field label='Nombre de la empresa *' error={errors.enterpriseName}>
                    <TextInput
                        style={styles.input}
                        value={form.enterpriseName}
                        onChangeText={(t) => setField('enterpriseName', t)}
                        placeholder='Eco-nexión S.A.S.'
                        editable={!loading}
                    />
                </Field>

                <Field label='NIT (opcional)'>
                    <TextInput
                        style={styles.input}
                        value={form.nit}
                        onChangeText={(t) => setField('nit', t)}
                        placeholder='123456789-0'
                        editable={!loading}
                    />
                </Field>

                <Field label='Nombre del usuario *' error={errors.username}>
                    <TextInput
                        style={styles.input}
                        value={form.username}
                        onChangeText={(t) => setField('username', t)}
                        editable={!loading}
                    />
                </Field>

                <Field label='Correo *' error={errors.email}>
                    <TextInput
                        style={[styles.input, isGoogleFlow && { backgroundColor: '#eee' }]}
                        value={form.email}
                        onChangeText={(t) => setField('email', t)}
                        editable={!loading && !isGoogleFlow}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </Field>

                {!isGoogleFlow && (
                    <Field label='Contraseña *' error={errors.password}>
                        <TextInput
                            style={styles.input}
                            value={form.password}
                            onChangeText={(t) => setField('password', t)}
                            editable={!loading}
                            secureTextEntry
                            placeholder="Mínimo 6 caracteres"
                        />
                    </Field>
                )}

                <Field label='Rol *'>
                    <View style={styles.row}>
                        {roles.map((r) => (
                            <Pressable
                                key={r.value}
                                onPress={() => setField('role', r.value)}
                                style={[styles.chip, form.role === r.value && styles.chipSelected]}
                                disabled={loading}
                            >
                                <Text style={[styles.chipText, form.role === r.value && styles.chipTextSelected]}>
                                    {r.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Field>

                <Pressable
                    style={[styles.submit, isSubmitDisabled() && styles.submitDisabled]}
                    onPress={onSubmit}
                    disabled={isSubmitDisabled()}
                >
                    {loading ? (
                        <ActivityIndicator color='#fff' />
                    ) : (
                        <Text style={styles.submitText}>Completar Registro</Text>
                    )}
                </Pressable>
            </ScrollView>

            <SuccessModal
                visible={showSuccessModal}
                title='¡Registro Exitoso!'
                message='Tu cuenta ha sido creada y verificada. Por favor inicia sesión nuevamente para obtener tu acceso seguro.'
                buttonText='Ir a Iniciar Sesión'
                onPress={() => {
                    setShowSuccessModal(false);
                    router.replace('/');
                }}
            />
        </SafeAreaView>
    );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <View style={{ marginBottom: Spacing.md }}>
            <Text style={styles.label}>{label}</Text>
            {children}
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.lightGray },
    container: { padding: Spacing.lg },
    header: { fontSize: 28, fontWeight: '800', color: Colors.ecoGreen, marginBottom: Spacing.lg },
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
    error: { color: '#D00', marginTop: Spacing.xs },
    row: { flexDirection: 'row', gap: Spacing.md },
    chip: {
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: '#fff',
    },
    chipSelected: { backgroundColor: Colors.limeGreen, borderColor: Colors.limeGreen },
    chipText: { color: Colors.gray },
    chipTextSelected: { color: '#fff', fontWeight: '600' },
    submit: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.ecoGreen,
        padding: Spacing.md,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitDisabled: { backgroundColor: Colors.gray },
    submitText: { color: '#fff', fontWeight: '700', fontSize: FontSize.medium },
    errorBox: {
        backgroundColor: '#FFEBEE',
        borderWidth: 2,
        borderColor: '#D32F2F',
        borderRadius: 12,
        padding: Spacing.md,
    },
    errorText: {
        color: '#D32F2F',
        fontWeight: '600',
        fontSize: FontSize.medium,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    errorLink: {
        color: '#1976D2',
        fontWeight: '700',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
