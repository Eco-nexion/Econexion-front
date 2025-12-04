import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userEmail: string;
}

export default function DeleteAccountModal({ visible, onClose, onConfirm, userEmail }: DeleteAccountModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la cuenta';
            console.error('Error deleting account:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType='fade' transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.iconContainer}>
                        <Ionicons name='warning' size={48} color='#DC2626' />
                    </View>

                    <Text style={styles.title}>¿Estás completamente seguro?</Text>
                    <Text style={styles.message}>
                        Esta acción es <Text style={styles.boldText}>permanente</Text> y no se puede deshacer. Se
                        eliminarán todos tus datos, publicaciones y ofertas.
                    </Text>

                    <View style={styles.emailBox}>
                        <Text style={styles.emailLabel}>Cuenta a eliminar:</Text>
                        <Text style={styles.emailText}>{userEmail}</Text>
                    </View>

                    <View style={styles.buttons}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.deleteButton, loading && styles.deleteButtonDisabled]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            <Ionicons name='trash' size={18} color='#fff' />
                            <Text style={styles.deleteButtonText}>{loading ? 'Eliminando...' : 'Eliminar'}</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xlarge,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    message: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: '700',
        color: '#DC2626',
    },
    emailBox: {
        backgroundColor: Colors.lightGray,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.lg,
    },
    emailLabel: {
        fontSize: FontSize.small,
        color: Colors.gray,
        marginBottom: Spacing.xs / 2,
    },
    emailText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
    },
    buttons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    button: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    cancelButton: {
        backgroundColor: Colors.lightGray,
    },
    cancelButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '700',
        color: '#fff',
    },
});
