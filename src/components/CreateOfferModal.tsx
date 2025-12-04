import type { CreateOfferRequest } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface CreateOfferModalProps {
    visible: boolean;
    publicationId: string;
    publicationTitle: string;
    onClose: () => void;
    onSave: (data: CreateOfferRequest) => Promise<void>;
}

export default function CreateOfferModal({
    visible,
    publicationId,
    publicationTitle,
    onClose,
    onSave,
}: CreateOfferModalProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        amount: '',
        message: '',
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        const amount = Number.parseFloat(formData.amount);
        if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
            newErrors.amount = 'Ingresa un monto válido mayor a 0';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'El mensaje es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const offerData: CreateOfferRequest = {
                amount: Number.parseFloat(formData.amount),
                message: formData.message.trim(),
                publicationId,
            };
            await onSave(offerData);
            // Reset form
            setFormData({ amount: '', message: '' });
            setErrors({});
            onClose();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la oferta';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ amount: '', message: '' });
        setErrors({});
        onClose();
    };

    return (
        <Modal visible={visible} animationType='slide' transparent presentationStyle='pageSheet'>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Nueva Oferta</Text>
                        <Pressable onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name='close' size={24} color={Colors.gray} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Información de la publicación - Estilo destacado */}
                        <View style={styles.publicationCard}>
                            <Text style={styles.publicationLabel}>Estás haciendo una oferta para:</Text>
                            <View style={styles.publicationInfo}>
                                <Ionicons name='document-text' size={24} color={Colors.ecoGreen} />
                                <Text style={styles.publicationTitle} numberOfLines={2}>
                                    {publicationTitle}
                                </Text>
                            </View>
                        </View>

                        {/* Error general */}
                        {errors.general ? (
                            <View style={styles.errorBox}>
                                <Ionicons name='alert-circle' size={20} color='#EF4444' />
                                <Text style={styles.errorText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        {/* Campo: Monto */}
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                Monto ofrecido <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name='cash-outline' size={20} color={Colors.gray} />
                                <TextInput
                                    style={styles.input}
                                    placeholder='0'
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                    keyboardType='numeric'
                                    editable={!loading}
                                />
                            </View>
                            {errors.amount ? <Text style={styles.errorField}>{errors.amount}</Text> : null}
                        </View>

                        {/* Campo: Mensaje */}
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                Mensaje <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder='Escribe un mensaje para el vendedor...'
                                value={formData.message}
                                onChangeText={(text) => setFormData({ ...formData, message: text })}
                                multiline
                                numberOfLines={4}
                                textAlignVertical='top'
                                editable={!loading}
                            />
                            {errors.message ? <Text style={styles.errorField}>{errors.message}</Text> : null}
                        </View>
                    </ScrollView>

                    {/* Footer con botones */}
                    <View style={styles.footer}>
                        <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color='#fff' />
                            ) : (
                                <>
                                    <Ionicons name='checkmark-circle' size={20} color='#fff' />
                                    <Text style={styles.saveButtonText}>Enviar Oferta</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: BorderRadius.xlarge,
        borderTopRightRadius: BorderRadius.xlarge,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    title: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    content: {
        padding: Spacing.md,
    },
    publicationCard: {
        backgroundColor: '#F0F9F0',
        borderWidth: 2,
        borderColor: Colors.ecoGreen,
        borderRadius: BorderRadius.large,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    publicationLabel: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: Colors.gray,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    publicationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    publicationTitle: {
        flex: 1,
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
        lineHeight: 24,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: '#FEE2E2',
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.md,
    },
    errorText: {
        flex: 1,
        fontSize: FontSize.small,
        color: '#EF4444',
    },
    field: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    required: {
        color: '#EF4444',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: BorderRadius.medium,
        paddingHorizontal: Spacing.md,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: FontSize.medium,
        color: Colors.text,
        paddingVertical: Spacing.sm + 2,
    },
    textArea: {
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: BorderRadius.medium,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 100,
    },
    errorField: {
        fontSize: FontSize.small,
        color: '#EF4444',
        marginTop: Spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.gray,
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        backgroundColor: Colors.ecoGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: Colors.gray,
    },
    saveButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: '#fff',
    },
});
