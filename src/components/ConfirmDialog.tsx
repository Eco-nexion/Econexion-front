import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </Pressable>
                        <Pressable style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    dialog: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.large,
        padding: Spacing.lg,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    message: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        marginBottom: Spacing.lg,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.lightGray,
    },
    confirmButton: {
        backgroundColor: '#DC2626',
    },
    cancelText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
    },
    confirmText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: '#fff',
    },
});
