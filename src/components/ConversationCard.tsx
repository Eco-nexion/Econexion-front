import type { ConversationSummary } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ConversationCardProps {
    conversation: ConversationSummary;
    currentUserId: number;
    onPress: () => void;
    // Placeholder props para futuras funcionalidades
    unreadCount?: number;
    offerInfo?: {
        material: string;
        status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    };
    otherParticipantName?: string;
}

export default function ConversationCard({
    conversation,
    currentUserId,
    onPress,
    unreadCount = 0,
    offerInfo,
    otherParticipantName = 'Usuario',
}: ConversationCardProps) {
    const formatTimestamp = (isoDate: string): string => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `Hace ${diffInMinutes}m`;
        }
        if (diffInHours < 24) {
            return `Hace ${diffInHours}h`;
        }
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return 'Ayer';
        }
        if (diffInDays < 7) {
            return `Hace ${diffInDays}d`;
        }
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'PENDING':
                return Colors.cyan;
            case 'ACCEPTED':
                return Colors.ecoGreen;
            case 'REJECTED':
                return '#EF4444';
            default:
                return Colors.gray;
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'PENDING':
                return 'Pendiente';
            case 'ACCEPTED':
                return 'Aceptada';
            case 'REJECTED':
                return 'Rechazada';
            default:
                return '';
        }
    };

    // Generar inicial del nombre
    const getInitial = (name: string): string => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
            <View style={styles.container}>
                {/* Avatar con inicial */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitial(otherParticipantName)}</Text>
                    </View>
                    {unreadCount > 0 ? (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Contenido principal */}
                <View style={styles.content}>
                    {/* Nombre y timestamp */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name} numberOfLines={1}>
                                {otherParticipantName}
                            </Text>
                            {offerInfo?.material ? (
                                <View style={styles.materialBadge}>
                                    <Ionicons name='leaf-outline' size={12} color={Colors.ecoGreen} />
                                    <Text style={styles.materialText}>{offerInfo.material}</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={styles.timestamp}>{formatTimestamp(conversation.updatedAt)}</Text>
                    </View>

                    {/* Preview del último mensaje */}
                    <Text style={styles.preview} numberOfLines={2}>
                        {conversation.lastMessagePreview || conversation.preview}
                    </Text>

                    {/* Status de la oferta */}
                    {offerInfo?.status ? (
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offerInfo.status) }]}>
                            <Text style={styles.statusText}>{getStatusLabel(offerInfo.status)}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        marginBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    container: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.ecoGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: '#fff',
    },
    unreadBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: BorderRadius.full,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
    unreadText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
        gap: Spacing.xs,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        flex: 1,
    },
    name: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    materialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.lightGray,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.small,
    },
    materialText: {
        fontSize: 10,
        color: Colors.ecoGreen,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: FontSize.small - 2,
        color: Colors.gray,
        marginLeft: Spacing.xs,
    },
    preview: {
        fontSize: FontSize.small,
        color: Colors.gray,
        lineHeight: 18,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.small,
        marginTop: Spacing.xs / 2,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
});
