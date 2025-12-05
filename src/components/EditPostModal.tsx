import type { Post, UpdatePostRequest } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface EditPostModalProps {
    visible: boolean;
    post: Post | null;
    onClose: () => void;
    onSave: (data: UpdatePostRequest) => Promise<void>;
}

export default function EditPostModal({ visible, post, onClose, onSave }: EditPostModalProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<UpdatePostRequest>({
        id: '',
        title: '',
        material: '',
        quantity: 0,
        price: 0,
        location: '',
        description: '',
        owner: '',
        offers: [],
    });

    // Cargar datos del post cuando se abre el modal
    useEffect(() => {
        if (post && visible) {
            setFormData({
                id: post.id,
                title: post.title,
                material: post.material,
                quantity: post.quantity,
                price: post.price,
                location: post.location,
                description: post.description,
                owner: post.owner || '',
                offers: post.offers.map((o) => (typeof o === 'string' ? o : o.id)),
            });
        }
    }, [post, visible]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }
        if (!formData.material.trim()) {
            newErrors.material = 'El material es obligatorio';
        }
        if (formData.quantity <= 0) {
            newErrors.quantity = 'La cantidad debe ser mayor a 0';
        }
        if (formData.price < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'La ubicación es obligatoria';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        console.log('🔵 [EditPostModal] ===== INICIANDO GUARDADO =====');

        if (!validateForm()) {
            console.log('🔵 [EditPostModal] Validación falló');
            return;
        }

        console.log('🔵 [EditPostModal] Validación exitosa');
        console.log('🔵 [EditPostModal] Datos del formulario completos:', JSON.stringify(formData, null, 2));

        setLoading(true);
        try {
            console.log('🔵 [EditPostModal] Llamando a onSave()...');
            await onSave(formData);
            console.log('🔵 [EditPostModal] ✅ onSave() completado exitosamente');
            setErrors({});
            console.log('🔵 [EditPostModal] Cerrando modal...');
            onClose();
            console.log('🔵 [EditPostModal] ===== GUARDADO COMPLETADO =====');
        } catch (error: unknown) {
            console.error('🔵 [EditPostModal] ===== ERROR AL GUARDAR =====');
            console.error('🔵 [EditPostModal] Error completo:', error);
            console.error('🔵 [EditPostModal] typeof error:', typeof error);
            console.error('🔵 [EditPostModal] error instanceof Error:', error instanceof Error);

            if (error instanceof Error) {
                console.error('🔵 [EditPostModal] Error.message:', error.message);
                console.error('🔵 [EditPostModal] Error.stack:', error.stack);
            }

            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la publicación';
            console.error('🔵 [EditPostModal] Mensaje de error para mostrar:', errorMessage);
            setErrors({ general: errorMessage });
            console.log('🔵 [EditPostModal] ===== FIN ERROR =====');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!post) {
        return null;
    }

    return (
        <Modal visible={visible} animationType='slide' transparent presentationStyle='pageSheet'>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Publicación</Text>
                        <Pressable onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name='close' size={24} color={Colors.gray} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Error general */}
                        {errors.general ? (
                            <View style={styles.errorBox}>
                                <Ionicons name='alert-circle' size={20} color='#DC2626' />
                                <Text style={styles.errorText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* Título */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Título *</Text>
                            <TextInput
                                style={[styles.input, errors.title && styles.inputError]}
                                value={formData.title}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, title: text });
                                    setErrors({ ...errors, title: '' });
                                }}
                                placeholder='Ej: Plastico PET reciclable'
                                placeholderTextColor={Colors.gray}
                            />
                            {errors.title ? <Text style={styles.fieldError}>{errors.title}</Text> : null}
                        </View>

                        {/* Material */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Material *</Text>
                            <TextInput
                                style={[styles.input, errors.material && styles.inputError]}
                                value={formData.material}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, material: text });
                                    setErrors({ ...errors, material: '' });
                                }}
                                placeholder='Ej: PET, Carton, Aluminio'
                                placeholderTextColor={Colors.gray}
                            />
                            {errors.material ? <Text style={styles.fieldError}>{errors.material}</Text> : null}
                        </View>

                        {/* Cantidad y Precio */}
                        <View style={styles.row}>
                            <View style={[styles.field, styles.halfField]}>
                                <Text style={styles.label}>Cantidad (kg) *</Text>
                                <TextInput
                                    style={[styles.input, errors.quantity && styles.inputError]}
                                    value={formData.quantity > 0 ? formData.quantity.toString() : ''}
                                    onChangeText={(text) => {
                                        const quantity = Number.parseInt(text) || 0;
                                        setFormData({ ...formData, quantity });
                                        setErrors({ ...errors, quantity: '' });
                                    }}
                                    placeholder='0'
                                    placeholderTextColor={Colors.gray}
                                    keyboardType='numeric'
                                />
                                {errors.quantity ? <Text style={styles.fieldError}>{errors.quantity}</Text> : null}
                            </View>

                            <View style={[styles.field, styles.halfField]}>
                                <Text style={styles.label}>Precio (COP) *</Text>
                                <TextInput
                                    style={[styles.input, errors.price && styles.inputError]}
                                    value={formData.price > 0 ? formData.price.toString() : ''}
                                    onChangeText={(text) => {
                                        const price = Number.parseInt(text) || 0;
                                        setFormData({ ...formData, price });
                                        setErrors({ ...errors, price: '' });
                                    }}
                                    placeholder='0'
                                    placeholderTextColor={Colors.gray}
                                    keyboardType='numeric'
                                />
                                {errors.price ? <Text style={styles.fieldError}>{errors.price}</Text> : null}
                            </View>
                        </View>

                        {/* Ubicación */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Ubicación *</Text>
                            <TextInput
                                style={[styles.input, errors.location && styles.inputError]}
                                value={formData.location}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, location: text });
                                    setErrors({ ...errors, location: '' });
                                }}
                                placeholder='Ej: Bogotá, Cundinamarca'
                                placeholderTextColor={Colors.gray}
                            />
                            {errors.location ? <Text style={styles.fieldError}>{errors.location}</Text> : null}
                        </View>

                        {/* Descripción */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Descripción *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                value={formData.description}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, description: text });
                                    setErrors({ ...errors, description: '' });
                                }}
                                placeholder='Describe el material, condiciones, etc.'
                                placeholderTextColor={Colors.gray}
                                multiline
                                numberOfLines={4}
                                textAlignVertical='top'
                            />
                            {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Ionicons name='checkmark-circle' size={20} color='#fff' />
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
        height: '90%',
        paddingTop: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    title: { fontSize: FontSize.xlarge, fontWeight: '700', color: Colors.text, flex: 1 },
    closeButton: { padding: Spacing.xs },
    content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: '#FEE2E2',
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.md,
    },
    errorText: { flex: 1, fontSize: FontSize.medium, color: '#DC2626' },
    field: { marginBottom: Spacing.md },
    label: { fontSize: FontSize.medium, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
    input: {
        backgroundColor: Colors.lightGray,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.medium,
        fontSize: FontSize.medium,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
    fieldError: { fontSize: FontSize.small, color: '#DC2626', marginTop: Spacing.xs },
    textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: Spacing.sm },
    row: { flexDirection: 'row', gap: Spacing.md },
    halfField: { flex: 1 },
    footer: {
        flexDirection: 'row',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.gray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: { fontSize: FontSize.medium, fontWeight: '600', color: Colors.gray },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        backgroundColor: Colors.ecoGreen,
    },
    saveButtonDisabled: { backgroundColor: Colors.gray, opacity: 0.6 },
    saveButtonText: { fontSize: FontSize.medium, fontWeight: '600', color: '#fff' },
});
