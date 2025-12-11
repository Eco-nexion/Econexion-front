import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface SuccessModalProps {
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onPress: () => void;
}

export default function SuccessModal({
    visible,
    title,
    message,
    buttonText = 'Continuar',
    onPress,
}: SuccessModalProps) {
    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onPress}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>✅</Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <Pressable style={styles.button} onPress={onPress}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </Pressable>
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
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        shadowColor: '#000',
        elevation: 5,
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: FontSize.xlarge,
        fontWeight: '800',
        color: Colors.ecoGreen,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        marginBottom: Spacing.lg,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        backgroundColor: Colors.ecoGreen,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.medium,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: FontSize.medium,
    },
});
