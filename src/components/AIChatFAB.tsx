import { Colors, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface AIChatFABProps {
    onPress: () => void;
    hasUnread?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Botón flotante (FAB) para abrir el chat con IA
 * Se posiciona en la esquina inferior derecha de la pantalla
 */
export default function AIChatFAB({ onPress, hasUnread = false }: AIChatFABProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedPressable
            style={[styles.fab, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            {/* Gradiente de fondo simulado con capas */}
            <View style={styles.fabBackground}>
                <Ionicons name='sparkles' size={28} color='#fff' />
            </View>

            {/* Badge de notificación (opcional) */}
            {hasUnread && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>•</Text>
                </View>
            )}

            {/* Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Asistente IA</Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: Spacing.md,
        bottom: 80, // Por encima del tab bar
        zIndex: 999,
        alignItems: 'center',
    },
    fabBackground: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366F1', // Púrpura para destacar como IA
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    labelContainer: {
        marginTop: 4,
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    label: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
});