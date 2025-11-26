import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    count?: number;
    color?: string;
    onPress: () => void;
}

export default function DashboardCard({
    title,
    description,
    icon,
    count,
    color = Colors.ecoGreen,
    onPress,
}: DashboardCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onPress}
            android_ripple={{ color: '#f0f0f0' }}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={32} color={color} />
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{title}</Text>
                    {count !== undefined && (
                        <View style={[styles.badge, { backgroundColor: color }]}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {description}
                </Text>
            </View>

            <Ionicons name='chevron-forward' size={24} color={Colors.gray} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: Spacing.md,
        borderRadius: BorderRadius.large,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: Spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        gap: Spacing.xs,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    title: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
    },
    description: {
        fontSize: FontSize.small,
        color: Colors.gray,
        lineHeight: 18,
    },
    badge: {
        minWidth: 24,
        height: 24,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xs,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
});
