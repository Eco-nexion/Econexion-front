import { Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RegisterForm, RegisterFormErrors, Role } from '@type/forms';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const roles: { label: string; value: Role }[] = [
    { label: 'Comprador', value: 'comprador' },
    { label: 'Vendedor', value: 'vendedor' },
];

export default function Register() {
    const router = useRouter();

    const [form, setForm] = useState<RegisterForm>({
        companyName: '',
        nit: '',
        userName: '',
        email: '',
        role: 'comprador',
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [submittedData, setSubmittedData] = useState<RegisterForm | null>(null);

    const decodeIdToken = (token: string) => {
        try {
            // El JWT tiene 3 partes separadas por puntos: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token inválido');
            }

            // Decodificar la parte payload (segunda parte)
            const payload = parts[1];

            // Convertir Base64URL a string
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

            // Parsear como JSON
            return JSON.parse(decoded);
        } catch (err) {
            console.error('Error decodificando ID Token:', err);
            return null;
        }
    };

    useEffect(() => {
        const loadGoogleUser = async () => {
            try {
                console.log('Cargando datos de usuario de Google...');
                const idToken = await AsyncStorage.getItem(STORAGE_KEYS.token);

                if (!idToken) {
                    console.error('No se encontró el ID Token');
                    return;
                }

                // Decodificar el ID Token
                const userData = decodeIdToken(idToken);

                if (!userData) {
                    console.error('No se pudo decodificar el ID Token');
                    return;
                }

                console.log('📦 Datos del usuario:', userData);

                setForm((prev) => ({
                    ...prev,
                    userName: userData.name || '',
                    email: userData.email || '',
                }));
            } catch (err) {
                console.error('Error cargando datos de Google', err);
            }
        };

        loadGoogleUser();
    }, []);

    const setField = (field: keyof RegisterForm, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const collectErrors = (f: RegisterForm): RegisterFormErrors => {
        const e: RegisterFormErrors = {};
        const required = ['companyName', 'userName', 'email'] as const;
        for (const key of required) {
            if (!(f[key] && f[key].toString().trim())) {
                e[key] = 'Requerido';
            }
        }
        return e;
    };

    const validate = (): boolean => {
        const errs = collectErrors(form);
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const isSubmitDisabled = (): boolean => {
        return !(form.companyName.trim() && form.userName.trim());
    };

    const onSubmit = async () => {
        if (!validate()) return;

        try {
            const idToken = await AsyncStorage.getItem(STORAGE_KEYS.token);

            console.log('🔑 TOKEN A ENVIAR:', idToken?.substring(0, 50) + '...');
            console.log('📏 Longitud del token:', idToken?.length);

            const URL_REGISTER =
                'http://app-back.gdg7amgzcxgzbygk.eastus2.azurecontainer.io:35000/api/auth/register/google';
            //const URL_REGISTER ='http://localhost:35000/api/auth/register/google';
            const response = await fetch(URL_REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    enterpriseName: form.companyName,
                    username: form.userName,
                    nit: form.nit,
                    email: form.email,
                    role: form.role,
                }),
            });
            console.log('Respuesta del registro:', response);

            if (!response.ok) throw new Error('Error al registrar usuario');

            const data = await response.json();
            console.log('✅ Registro completado:', data);
            setSubmittedData(form);

            // Redirige después del registro
            router.replace('/dashboard');
        } catch (err) {
            console.error('❌ Error en el registro:', err);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <Text style={styles.header}>Completa tu registro</Text>

                <Field label='Nombre de la empresa' error={errors.companyName}>
                    <TextInput
                        style={styles.input}
                        value={form.companyName}
                        onChangeText={(t) => setField('companyName', t)}
                    />
                </Field>

                <Field label='NIT (opcional)'>
                    <TextInput
                        style={styles.input}
                        value={form.nit}
                        onChangeText={(t) => setField('nit', t)}
                        placeholder='123456789-0'
                    />
                </Field>

                <Field label='Nombre del usuario' error={errors.userName}>
                    <TextInput style={[styles.input, { backgroundColor: '#eee' }]} value={form.userName} />
                </Field>

                <Field label='Correo electrónico' error={errors.email}>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#eee' }]}
                        value={form.email}
                        editable={false}
                    />
                </Field>

                <Field label='Rol'>
                    <View style={styles.row}>
                        {roles.map((r) => (
                            <Pressable
                                key={r.value}
                                onPress={() => setField('role', r.value)}
                                style={[styles.chip, form.role === r.value && styles.chipSelected]}
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
                    <Text style={styles.submitText}>Confirmar registro</Text>
                </Pressable>

                {submittedData && (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteTitle}>Datos enviados</Text>
                        <Text style={styles.noteText}>{JSON.stringify(submittedData, null, 2)}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// --- COMPONENTE FIELD AUXILIAR ---
const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: Spacing.md }}>
        <Text style={styles.label}>{label}</Text>
        {children}
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
);

// --- ESTILOS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.lightGray },
    container: { padding: Spacing.lg },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: Spacing.md },
    label: { fontSize: FontSize.medium, color: Colors.gray },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: Spacing.sm,
        marginTop: 4,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chip: {
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    chipSelected: { backgroundColor: Colors.ecoGreen },
    chipText: { color: Colors.gray },
    chipTextSelected: { color: '#fff' },
    submit: {
        backgroundColor: Colors.ecoGreen,
        padding: 12,
        borderRadius: 10,
        marginTop: Spacing.md,
    },
    submitDisabled: { backgroundColor: '#aaa' },
    submitText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    error: { color: 'red', fontSize: FontSize.small },
    noteBox: { backgroundColor: '#eee', padding: Spacing.sm, borderRadius: 8, marginTop: 16 },
    noteTitle: { fontWeight: 'bold' },
    noteText: { fontSize: FontSize.small, color: '#444' },
});
