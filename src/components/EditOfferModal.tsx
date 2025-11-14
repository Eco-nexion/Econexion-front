import type { Offer } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface EditOfferModalProps {
    visible: boolean;
    offer: Offer;
    onClose: () => void;
    onSave: (offerId: string, amount: number, message: string) => Promise<void>;
}

export default function EditOfferModal({ visible, offer, onClose, onSave }: EditOfferModalProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        amount: offer.amount.toString(),
        message: offer.message,
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
            await onSave(offer.id, Number.parseFloat(formData.amount), formData.message.trim());
            onClose();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la oferta';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType='slide' transparent presentationStyle='pageSheet'>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Oferta</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name='close' size={24} color={Colors.gray} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Publicación info (no editable) */}
                        <View style={styles.publicationInfo}>
                            <Ionicons name='document-text-outline' size={20} color={Colors.gray} />
                            <View style={styles.publicationDetails}>
                                <Text style={styles.publicationLabel}>Publicación</Text>
                                <Text style={styles.publicationTitle} numberOfLines={2}>
                                    {offer.publication.title}
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
                                placeholder='Escribe un mensaje...'
                                value={formData.message}
                                onChangeText={(text) => setFormData({ ...formData, message: text })}
                                multiline
                                numberOfLines={4}
                                textAlignVertical='top'
                                editable={!loading}
                            />
                            {errors.message ? <Text style={styles.errorField}>{errors.message}</Text> : null}
                        </View>

                        {/* Info de campos no editables */}
                        <View style={styles.infoBox}>
                            <Ionicons name='information-circle' size={20} color={Colors.cyan} />
                            <Text style={styles.infoText}>
                                No puedes cambiar la publicación ni el estado de la oferta
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer con botones */}
                    <View style={styles.footer}>
                        <Pressable style={styles.cancelButton} onPress={onClose} disabled={loading}>
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
                                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
    publicationInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: Colors.lightGray,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.md,
    },
    publicationDetails: {
        flex: 1,
    },
    publicationLabel: {
        fontSize: FontSize.small,
        color: Colors.gray,
        marginBottom: Spacing.xs / 2,
    },
    publicationTitle: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: '#E0F2FE',
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.md,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.small,
        color: Colors.cyan,
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
