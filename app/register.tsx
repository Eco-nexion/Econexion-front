import { useAuth } from '@/src/contexts/AuthContext';
import { API_CONFIG, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import type { RegisterForm, RegisterFormErrors, Role } from '@type/forms';
import { storage } from '@utils';
import { Link, useRouter } from 'expo-router';
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
    const { refreshAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const [form, setForm] = useState<RegisterForm>({
        enterpriseName: '',
        nit: '',
        username: '',
        email: '',
        role: 'BUYER',
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
        if (!f.email.trim()) {
            e.email = 'Requerido';
        }
        return e;
    }, []);

    useEffect(() => {
        const loadGoogleData = async () => {
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
        };
        loadGoogleData();
    }, [collectErrors]);

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
            const idToken = await storage.getItem(STORAGE_KEYS.token);

            // 1. Registrar usuario en el backend
            const registerResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // biome-ignore lint/style/useNamingConvention: <backend expects>
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    enterpriseName: form.enterpriseName,
                    username: form.username,
                    nit: form.nit,
                    email: form.email,
                    role: form.role,
                }),
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                throw new Error(`Error al registrar: ${errorText}`);
            }

            console.log('✅ Registro completado');

            // 2. Obtener datos completos del usuario desde /lab/users/exists/{email}
            const userDataResponse = await fetch(
                `${API_CONFIG.BASE_URL}/lab/users/exists/${encodeURIComponent(form.email)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!userDataResponse.ok) {
                throw new Error('Error al obtener datos del usuario');
            }

            const userData = await userDataResponse.json();
            console.log('✅ Datos del usuario obtenidos');

            // 3. Guardar TODO en storage
            await storage.setItem(STORAGE_KEYS.token, idToken || '');
            await storage.setItem(STORAGE_KEYS.user_id, userData.id);
            await storage.setItem(STORAGE_KEYS.user_enterprise_name, userData.enterpriseName);
            await storage.setItem(STORAGE_KEYS.user_username, userData.username);
            await storage.setItem(STORAGE_KEYS.user_nit, userData.nit || '');
            await storage.setItem(STORAGE_KEYS.user_email, userData.email);
            await storage.setItem(STORAGE_KEYS.user_rol, userData.rol);
            
            console.log('✅ Datos guardados, refrescando auth...');
            
            // 4. Refrescar auth y navegar
            await refreshAuth();
            console.log('✅ Auth refrescado, navegando');
            
            Alert.alert('¡Éxito!', 'Bienvenido a Econexion! ♻️');
            router.replace('/(tabs)/home');
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
                        style={[styles.input, { backgroundColor: '#eee' }]}
                        value={form.email}
                        editable={false}
                    />
                </Field>

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
