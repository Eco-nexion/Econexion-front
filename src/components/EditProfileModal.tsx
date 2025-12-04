import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: EditProfileData) => Promise<void>;
    initialData: { enterpriseName: string; username: string; nit: string; email: string };
}

export interface EditProfileData {
    enterpriseName: string;
    name: string;
    nit: string;
    email: string;
}

export default function EditProfileModal({ visible, onClose, onSave, initialData }: EditProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<EditProfileData>({
        enterpriseName: initialData.enterpriseName,
        name: initialData.username,
        nit: initialData.nit,
        email: initialData.email,
    });

    useEffect(() => {
        // Load defaults from secure storage; fall back to initialData
        const loadDefaults = async () => {
            try {
                const enterpriseName =
                    (await storage.getItem(STORAGE_KEYS.user_enterprise_name)) || initialData.enterpriseName || '';
                const username = (await storage.getItem(STORAGE_KEYS.user_username)) || initialData.username || '';
                const nit = (await storage.getItem(STORAGE_KEYS.user_nit)) || initialData.nit || '';
                const email = (await storage.getItem(STORAGE_KEYS.user_email)) || initialData.email || '';

                setFormData({ enterpriseName, name: username, nit, email });
            } catch (err) {
                console.error('Error loading defaults for EditProfileModal:', err);
            }
        };

        loadDefaults();
    }, [initialData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType='slide' transparent presentationStyle='pageSheet'>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Perfil</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name='close' size={24} color={Colors.gray} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Nombre de la empresa</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.enterpriseName}
                                onChangeText={(text) => setFormData({ ...formData, enterpriseName: text })}
                                placeholder='Nombre de la empresa'
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Nombre del usuario</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder='Tu nombre completo'
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>NIT (opcional)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nit}
                                onChangeText={(text) => setFormData({ ...formData, nit: text })}
                                placeholder='000000000-0'
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder='correo@ejemplo.com'
                                keyboardType='email-address'
                                autoCapitalize='none'
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: BorderRadius.xlarge,
        borderTopRightRadius: BorderRadius.xlarge,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    title: { fontSize: FontSize.xlarge, fontWeight: '700', color: Colors.text },
    closeButton: { padding: Spacing.xs },
    content: { padding: Spacing.lg },
    field: { marginBottom: Spacing.lg },
    label: { fontSize: FontSize.medium, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: BorderRadius.medium,
        padding: Spacing.md,
        fontSize: FontSize.medium,
        backgroundColor: '#fff',
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.lg,
        gap: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    cancelButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.gray,
        alignItems: 'center',
    },
    cancelButtonText: { fontSize: FontSize.medium, fontWeight: '600', color: Colors.gray },
    saveButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        backgroundColor: Colors.ecoGreen,
        alignItems: 'center',
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: FontSize.medium, fontWeight: '700', color: '#fff' },
});
