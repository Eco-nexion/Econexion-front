import type { Offer } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface OfferDetailModalProps {
    visible: boolean;
    offer: Offer | null;
    currentUserId: string;
    onClose: () => void;
    onAccept?: (offerId: string) => Promise<void>;
    onReject?: (offerId: string) => Promise<void>;
    onEdit?: (offer: Offer) => void;
    onDelete?: (offerId: string) => Promise<void>;
    loading?: boolean;
}

export default function OfferDetailModal({
    visible,
    offer,
    currentUserId,
    onClose,
    onAccept,
    onReject,
    onEdit,
    onDelete,
    loading = false,
}: OfferDetailModalProps) {
    if (!offer) {
        return null;
    }

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal visible={visible} animationType='slide' transparent presentationStyle='pageSheet'>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Detalle de Oferta</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name='close' size={24} color={Colors.gray} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Estado */}
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
                            <Text style={styles.statusText}>{getStatusLabel(offer.status)}</Text>
                        </View>

                        {/* Publicación */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Publicación</Text>
                            <View style={styles.detailCard}>
                                <Text style={styles.detailTitle}>{offer.publication.title}</Text>
                                <Text style={styles.detailText}>{offer.publication.description}</Text>
                                <View style={styles.detailRow}>
                                    <Ionicons name='cube-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Material:</Text>
                                    <Text style={styles.detailValue}>{offer.publication.material}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name='scale-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Cantidad:</Text>
                                    <Text style={styles.detailValue}>{offer.publication.quantity} kg</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name='cash-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Precio referencia:</Text>
                                    <Text style={styles.detailValue}>${offer.publication.price.toLocaleString()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name='location-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Ubicación:</Text>
                                    <Text style={styles.detailValue}>{offer.publication.location}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Oferta */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Oferta</Text>
                            <View style={styles.detailCard}>
                                <View style={styles.amountRow}>
                                    <Text style={styles.amountLabel}>Monto Ofrecido</Text>
                                    <Text style={styles.amountValue}>${offer.amount.toLocaleString()}</Text>
                                </View>
                                {offer.message ? (
                                    <View style={styles.messageContainer}>
                                        <Text style={styles.messageLabel}>Mensaje:</Text>
                                        <Text style={styles.messageText}>"{offer.message}"</Text>
                                    </View>
                                ) : null}
                                <View style={styles.detailRow}>
                                    <Ionicons name='calendar-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Fecha:</Text>
                                    <Text style={styles.detailValue}>{formatDate(offer.date)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Oferente */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Oferente</Text>
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <Ionicons name='business-outline' size={16} color={Colors.ecoGreen} />
                                    <Text style={styles.detailLabel}>Empresa:</Text>
                                    <Text style={styles.detailValue}>{offer.offerer.enterpriseName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name='person-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Usuario:</Text>
                                    <Text style={styles.detailValue}>@{offer.offerer.username}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name='mail-outline' size={16} color={Colors.gray} />
                                    <Text style={styles.detailLabel}>Email:</Text>
                                    <Text style={styles.detailValue}>{offer.offerer.email}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer con acciones */}
                    {loading ? (
                        <View style={styles.footer}>
                            <ActivityIndicator size='large' color={Colors.ecoGreen} />
                        </View>
                    ) : (
                        <View style={styles.footer}>
                            {isOwner && offer.status === 'PENDING' ? (
                                <>
                                    <Pressable
                                        style={[styles.actionButton, styles.acceptButton]}
                                        onPress={() => onAccept?.(offer.id)}
                                    >
                                        <Ionicons name='checkmark-circle' size={20} color='#fff' />
                                        <Text style={styles.actionButtonText}>Aceptar</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => onReject?.(offer.id)}
                                    >
                                        <Ionicons name='close-circle' size={20} color='#fff' />
                                        <Text style={styles.actionButtonText}>Rechazar</Text>
                                    </Pressable>
                                </>
                            ) : isOfferer && offer.status === 'PENDING' ? (
                                <>
                                    <Pressable
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={() => onEdit?.(offer)}
                                    >
                                        <Ionicons name='create-outline' size={20} color={Colors.ecoGreen} />
                                        <Text style={[styles.actionButtonText, { color: Colors.ecoGreen }]}>
                                            Editar
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => onDelete?.(offer.id)}
                                    >
                                        <Ionicons name='trash-outline' size={20} color='#EF4444' />
                                        <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Eliminar</Text>
                                    </Pressable>
                                </>
                            ) : null}
                        </View>
                    )}
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
        maxHeight: '90%',
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
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.medium,
        marginBottom: Spacing.md,
    },
    statusText: {
        color: '#fff',
        fontSize: FontSize.medium,
        fontWeight: '600',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.medium,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    detailCard: {
        backgroundColor: Colors.lightGray,
        padding: Spacing.md,
        borderRadius: BorderRadius.medium,
        gap: Spacing.sm,
    },
    detailTitle: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    detailText: {
        fontSize: FontSize.small,
        color: Colors.gray,
        marginBottom: Spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    detailLabel: {
        fontSize: FontSize.small,
        color: Colors.gray,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: FontSize.small,
        color: Colors.text,
        flex: 1,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    amountLabel: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
    },
    amountValue: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: Colors.ecoGreen,
    },
    messageContainer: {
        marginBottom: Spacing.sm,
    },
    messageLabel: {
        fontSize: FontSize.small,
        color: Colors.gray,
        fontWeight: '600',
        marginBottom: Spacing.xs / 2,
    },
    messageText: {
        fontSize: FontSize.small,
        color: Colors.text,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.medium,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    acceptButton: {
        backgroundColor: Colors.ecoGreen,
        borderColor: Colors.ecoGreen,
    },
    rejectButton: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    editButton: {
        backgroundColor: '#fff',
        borderColor: Colors.ecoGreen,
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderColor: '#EF4444',
    },
    actionButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: '#fff',
    },
});
