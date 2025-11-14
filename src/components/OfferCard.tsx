import type { Offer } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface OfferCardProps {
    offer: Offer;
    currentUserId: string;
    onPress: () => void;
    onAccept?: () => void;
    onReject?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewPublication?: () => void;
    onOpenChat?: () => void;
}

export default function OfferCard({
    offer,
    currentUserId,
    onPress,
    onAccept,
    onReject,
    onEdit,
    onDelete,
    onViewPublication,
    onOpenChat,
}: OfferCardProps) {
    const isOwner = offer.publication.owner === currentUserId;
    const isOfferer = offer.offerer.id === currentUserId;

    const getStatusColor = (status: string) => {
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Pendiente';
            case 'ACCEPTED':
                return 'Aceptada';
            case 'REJECTED':
                return 'Rechazada';
            default:
                return status;
        }
    };

    const getMaterialIcon = (material: string): keyof typeof Ionicons.glyphMap => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            PET: 'water-outline',
            Cartón: 'cube-outline',
            Aluminio: 'nutrition-outline',
            Vidrio: 'wine-outline',
            Papel: 'document-outline',
            Plástico: 'flask-outline',
        };
        return icons[material] || 'leaf-outline';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `Hace ${diffInMinutes} min`;
        }
        if (diffInHours < 24) {
            return `Hace ${diffInHours}h`;
        }
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return 'Ayer';
        }
        if (diffInDays < 7) {
            return `Hace ${diffInDays} días`;
        }
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    };

    return (
        <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
            {/* Header: Status badge y fecha */}
            <View style={styles.header}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(offer.status)}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(offer.date)}</Text>
            </View>

            {/* Publicación info */}
            <View style={styles.publicationSection}>
                <View style={styles.materialBadge}>
                    <Ionicons name={getMaterialIcon(offer.publication.material)} size={18} color={Colors.ecoGreen} />
                    <Text style={styles.materialText}>{offer.publication.material}</Text>
                </View>
                <Text style={styles.publicationTitle} numberOfLines={1}>
                    {offer.publication.title}
                </Text>
                <View style={styles.publicationInfo}>
                    <View style={styles.infoItem}>
                        <Ionicons name='cash-outline' size={14} color={Colors.gray} />
                        <Text style={styles.infoText}>Precio ref: ${offer.publication.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name='location-outline' size={14} color={Colors.gray} />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {offer.publication.location}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Separador */}
            <View style={styles.divider} />

            {/* Oferta info */}
            <View style={styles.offerSection}>
                <View style={styles.offerHeader}>
                    <View style={styles.offererInfo}>
                        <Ionicons name='business-outline' size={16} color={Colors.ecoGreen} />
                        <Text style={styles.offererName} numberOfLines={1}>
                            {offer.offerer.enterpriseName}
                        </Text>
                    </View>
                    <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>${offer.amount.toLocaleString()}</Text>
                    </View>
                </View>
                {offer.message ? (
                    <Text style={styles.message} numberOfLines={2}>
                        "{offer.message}"
                    </Text>
                ) : null}
            </View>

            {/* Acciones según rol */}
            <View style={styles.actions}>
                {isOwner ? (
                    <>
                        {/* Botones para el dueño de la publicación */}
                        {offer.status === 'PENDING' ? (
                            <>
                                <Pressable
                                    style={[styles.actionButton, styles.acceptButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onAccept?.();
                                    }}
                                >
                                    <Ionicons name='checkmark-circle' size={18} color='#fff' />
                                    <Text style={styles.actionButtonText}>Aceptar</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onReject?.();
                                    }}
                                >
                                    <Ionicons name='close-circle' size={18} color='#fff' />
                                    <Text style={styles.actionButtonText}>Rechazar</Text>
                                </Pressable>
                            </>
                        ) : null}
                        <Pressable
                            style={[styles.actionButton, styles.chatButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onOpenChat?.();
                            }}
                        >
                            <Ionicons name='chatbubble-outline' size={18} color={Colors.ecoGreen} />
                            <Text style={[styles.actionButtonText, { color: Colors.ecoGreen }]}>Chat</Text>
                        </Pressable>
                    </>
                ) : isOfferer ? (
                    <>
                        {/* Botones para el oferente */}
                        {offer.status === 'PENDING' ? (
                            <>
                                <Pressable
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onEdit?.();
                                    }}
                                >
                                    <Ionicons name='create-outline' size={18} color={Colors.ecoGreen} />
                                    <Text style={[styles.actionButtonText, { color: Colors.ecoGreen }]}>Editar</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onDelete?.();
                                    }}
                                >
                                    <Ionicons name='trash-outline' size={18} color='#EF4444' />
                                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Eliminar</Text>
                                </Pressable>
                            </>
                        ) : null}
                        <Pressable
                            style={[styles.actionButton, styles.viewButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onViewPublication?.();
                            }}
                        >
                            <Ionicons name='document-text-outline' size={18} color={Colors.gray} />
                            <Text style={[styles.actionButtonText, { color: Colors.gray }]}>Ver publicación</Text>
                        </Pressable>
                    </>
                ) : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.large,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.medium,
    },
    statusText: {
        color: '#fff',
        fontSize: FontSize.small,
        fontWeight: '600',
    },
    dateText: {
        fontSize: FontSize.small - 2,
        color: Colors.gray,
    },
    publicationSection: {
        marginBottom: Spacing.sm,
    },
    materialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    materialText: {
        fontSize: FontSize.small,
        color: Colors.ecoGreen,
        fontWeight: '600',
    },
    publicationTitle: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    publicationInfo: {
        gap: Spacing.xs,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    infoText: {
        fontSize: FontSize.small,
        color: Colors.gray,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.lightGray,
        marginVertical: Spacing.sm,
    },
    offerSection: {
        marginBottom: Spacing.sm,
    },
    offerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    offererInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        flex: 1,
    },
    offererName: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    amountBadge: {
        backgroundColor: Colors.ecoGreen,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.medium,
    },
    amountText: {
        fontSize: FontSize.medium,
        fontWeight: '700',
        color: '#fff',
    },
    message: {
        fontSize: FontSize.small,
        color: Colors.gray,
        fontStyle: 'italic',
        marginTop: Spacing.xs,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    acceptButton: {
        backgroundColor: Colors.ecoGreen,
        borderColor: Colors.ecoGreen,
    },
    rejectButton: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    chatButton: {
        backgroundColor: '#fff',
        borderColor: Colors.ecoGreen,
    },
    editButton: {
        backgroundColor: '#fff',
        borderColor: Colors.ecoGreen,
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderColor: '#EF4444',
    },
    viewButton: {
        backgroundColor: '#fff',
        borderColor: Colors.lightGray,
    },
    actionButtonText: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: '#fff',
    },
});
