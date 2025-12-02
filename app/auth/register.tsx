import { Colors, FontSize, Spacing } from '@constants';
import { isEmailValid, MAX_PHOTO_SIZE_MB, type RegisterForm, type RegisterFormErrors, type Role } from '@type/forms';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "@/src/contexts/AuthContext";

const roles: { label: string; value: Role }[] = [
    { label: 'Comprador', value: 'comprador' },
    { label: 'Vendedor', value: 'vendedor' },
];

export default function Register() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [form, setForm] = useState<RegisterForm>({
        companyName: '',
        nit: '',
        userName: '',
        position: '',
        photoUri: undefined,
        email: '',
        password: '',
        confirmPassword: '',
        role: 'comprador',
    });
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Nuevo: Estado para modal

    const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) =>
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            setErrors(collectErrors(next));
            return next;
        });

    const collectErrors = (f: RegisterForm): RegisterFormErrors => {
        const e: RegisterFormErrors = {};
        const requiredKeys = ['companyName', 'userName', 'position', 'email'] as const;
        for (const k of requiredKeys) {
            const v = f[k];
            if (typeof v === 'string') {
                if (!v.trim()) {
                    e[k] = 'Requerido';
                }
            }
        }
        if (!f.role) {
            e.role = 'Requerido';
        }
        if (!f.password) {
            e.password = 'Requerido';
        }
        if (!f.confirmPassword) {
            e.confirmPassword = 'Requerido';
        }
        if (f.email && !isEmailValid(f.email)) {
            e.email = 'Correo inválido';
        }
        if (f.password && f.confirmPassword && f.password !== f.confirmPassword) {
            e.confirmPassword = 'Las contraseñas no coinciden';
        }
        return e;
    };

    const validate = (): boolean => {
        const e = collectErrors(form);
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onPickImage = () => {
        const demoUrl = 'https://via.placeholder.com/80';
        setField('photoUri', demoUrl);
        setErrors((prev) => ({ ...prev, photoUri: undefined }));
    };

    const isSubmitDisabled = () => {
        const requiredFilled =
            form.companyName.trim().length > 0 &&
            form.userName.trim().length > 0 &&
            form.position.trim().length > 0 &&
            form.email.trim().length > 0 &&
            form.password.trim().length > 0 &&
            form.confirmPassword.trim().length > 0 &&
            !!form.role;
        return !requiredFilled || Object.keys(errors).length > 0;
    };

    const onSubmit = async () => {
        if (!validate()) {
            return;
        }

        const backendRole = form.role === 'comprador' ? 'RECYCLER' : 'GENERATOR';
        const result = await signUp({
            companyName: form.companyName,
            nit: form.nit,
            userName: form.userName,
            position: form.position,
            photoUri: form.photoUri,
            email: form.email,
            password: form.password,
            role: backendRole,
        });

        console.log('SignUp result:', result);

        if (!result.success) {
            setErrors({ ...errors, general: result.error || 'Error desconocido' });
        } else {
            setShowSuccessModal(true); // Nuevo: Muestra modal en lugar de Alert
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <Text style={styles.header}>Registro</Text>
                <Field label='Nombre de la empresa' error={errors.companyName}>
                    <TextInput
                        style={styles.input}
                        value={form.companyName}
                        onChangeText={(t) => setField('companyName', t)}
                        placeholder='Eco-nexión S.A.S.'
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
                    <TextInput
                        style={styles.input}
                        value={form.userName}
                        onChangeText={(t) => setField('userName', t)}
                        placeholder='Nombre y apellido'
                    />
                </Field>
                <Field label='Cargo en la empresa' error={errors.position}>
                    <TextInput
                        style={styles.input}
                        value={form.position}
                        onChangeText={(t) => setField('position', t)}
                        placeholder='Ej. Compras'
                    />
                </Field>
                <Field label='Foto (opcional)' error={errors.photoUri}>
                    <View style={styles.row}>
                        <Pressable style={styles.buttonOutline} onPress={onPickImage}>
                            <Text style={styles.buttonOutlineText}>Elegir foto</Text>
                        </Pressable>
                        {form.photoUri ? <Image source={{ uri: form.photoUri }} style={styles.thumb} /> : null}
                    </View>
                </Field>
                <Field label='Correo' error={errors.email}>
                    <TextInput
                        style={styles.input}
                        value={form.email}
                        onChangeText={(t) => setField('email', t)}
                        placeholder='correo@dominio.com'
                        keyboardType='email-address'
                        autoCapitalize='none'
                    />
                </Field>
                <Field label='Contraseña' error={errors.password}>
                    <TextInput
                        style={styles.input}
                        value={form.password}
                        onChangeText={(t) => setField('password', t)}
                        placeholder='Ingresa tu clave'
                        secureTextEntry
                    />
                </Field>
                <Field label='Verificar contraseña' error={errors.confirmPassword}>
                    <TextInput
                        style={styles.input}
                        value={form.confirmPassword}
                        onChangeText={(t) => setField('confirmPassword', t)}
                        placeholder='Repite tu clave'
                        secureTextEntry
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
                {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}
                <Pressable
                    style={[styles.submit, isSubmitDisabled() && styles.submitDisabled]}
                    onPress={onSubmit}
                    disabled={isSubmitDisabled()}
                    accessibilityRole='button'
                >
                    <Text style={styles.submitText}>Confirmar</Text>
                </Pressable>
                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
                    <Link href={{ pathname: '/auth/login' }} style={styles.loginLink}>
                        Inicia sesión
                    </Link>
                </View>
                <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>Notas</Text>
                    <Text style={styles.noteText}>
                        - Los campos obligatorios no pueden estar vacíos.{'\n'}- El correo debe tener un formato válido.
                        {'\n'}- La foto no puede ser muy pesada (límite: {MAX_PHOTO_SIZE_MB}MB).
                    </Text>
                </View>
            </ScrollView>

            {/* Nuevo: Modal custom para success */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)} // Cierra en backdrop Android
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¡Éxito!</Text>
                        <Text style={styles.modalMessage}>Usuario registrado correctamente. Ahora inicia sesión.</Text>
                        <Pressable
                            style={styles.modalButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.replace('/auth/login');
                            }}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    buttonOutline: {
        borderWidth: 1,
        borderColor: Colors.ecoGreen,
        borderRadius: 10,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: '#fff',
    },
    buttonOutlineText: { color: Colors.ecoGreen, fontWeight: '600' },
    thumb: { width: 40, height: 40, borderRadius: 8 },
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
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.md,
    },
    loginText: { color: Colors.gray },
    loginLink: { color: Colors.cyan, fontWeight: '600' },
    noteBox: {
        marginTop: Spacing.lg,
        backgroundColor: '#FFFFFFAA',
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 12,
        padding: Spacing.md,
    },
    noteTitle: { fontWeight: '700', marginBottom: Spacing.xs, color: Colors.gray },
    noteText: { color: Colors.gray },
    // Nuevos estilos para modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Backdrop semi-transparente
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
        color: Colors.ecoGreen,
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