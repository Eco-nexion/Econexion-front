import type React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface AcceptRejectDialogProps {
    visible: boolean;
    title: string;
    message: string;
    acceptText?: string;
    rejectText?: string;
    cancelText?: string;
    onAccept: () => void;
    onReject: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export const AcceptRejectDialog: React.FC<AcceptRejectDialogProps> = ({
    visible,
    title,
    message,
    acceptText = 'Aceptar',
    rejectText = 'Rechazar',
    cancelText = 'Cancelar',
    onAccept,
    onReject,
    onCancel,
    loading = false,
}) => {
    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onCancel} statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size='large' color='#10b981' />
                            <Text style={styles.loadingText}>Procesando...</Text>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer}>
                            {/* Botón Cancelar */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.cancelButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={onCancel}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</Text>
                            </Pressable>

                            {/* Botón Rechazar */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.rejectButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={onReject}
                            >
                                <Text style={[styles.buttonText, styles.rejectButtonText]}>{rejectText}</Text>
                            </Pressable>

                            {/* Botón Aceptar */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.acceptButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={onAccept}
                            >
                                <Text style={[styles.buttonText, styles.acceptButtonText]}>{acceptText}</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1f2937',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        marginBottom: 24,
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#6b7280',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    rejectButtonText: {
        color: 'white',
    },
    acceptButton: {
        backgroundColor: '#10b981',
    },
    acceptButtonText: {
        color: 'white',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
});
