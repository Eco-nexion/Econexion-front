import { AcceptRejectDialog } from '@/src/components';
import ConfirmDialog from '@/src/components/ConfirmDialog';
import CreateOfferModal from '@/src/components/CreateOfferModal';
import EditOfferModal from '@/src/components/EditOfferModal';
import OfferCard from '@/src/components/OfferCard';
import OfferDetailModal from '@/src/components/OfferDetailModal';
import { offersService } from '@/src/services/offersService';
import type { Offer, OfferStatus } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'received' | 'sent';
type FilterStatus = OfferStatus | 'ALL';

export default function OffersTab() {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('received');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [offers, setOffers] = useState<Offer[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modales
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalPublicationId] = useState('');
    const [createModalPublicationTitle] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Estados para diálogos de confirmación
    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [pendingOfferAction, setPendingOfferAction] = useState<string | null>(null);

    // Obtener userId y email al montar
    useEffect(() => {
        const getUserData = async () => {
            const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-1';
            const userEmail = (await storage.getItem(STORAGE_KEYS.user_email)) || '';
            setCurrentUserId(userId);
            setCurrentUserEmail(userEmail);
        };
        getUserData();
    }, []);

    // Cargar ofertas
    const loadOffers = useCallback(async () => {
        console.group('📋 [Offers] loadOffers');
        try {
            console.log('🔄 [Offers] Modo:', viewMode);
            setLoading(true);
            const data =
                viewMode === 'received' ? await offersService.getReceivedOffers() : await offersService.getMyOffers();
            console.log('✅ [Offers] Ofertas cargadas:', data.length);
            setOffers(data);
        } catch (error) {
            console.error('❌ [Offers] Error al cargar ofertas:', error);
        } finally {
            setLoading(false);
            console.groupEnd();
        }
    }, [viewMode]);

    // Cargar al montar y cuando cambia el modo
    useEffect(() => {
        if (currentUserId) {
            loadOffers();
        }
    }, [currentUserId, loadOffers]);

    // Filtrar ofertas por estado
    useEffect(() => {
        if (filterStatus === 'ALL') {
            setFilteredOffers(offers);
        } else {
            setFilteredOffers(offers.filter((offer) => offer.status === filterStatus));
        }
    }, [offers, filterStatus]);

    // Refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await loadOffers();
        setRefreshing(false);
    };

    // Aceptar oferta (con optimistic update)
    const handleAcceptOffer = async (offerId: string) => {
        console.group('✅ [Offers] handleAcceptOffer');
        try {
            console.log('🔄 [Offers] Aceptando oferta:', offerId);
            setActionLoading(true);

            // Optimistic update
            setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'ACCEPTED' as OfferStatus } : o)));

            await offersService.acceptOffer(offerId);

            console.log('✅ [Offers] Oferta aceptada exitosamente');
            setShowDetailModal(false);
            setShowAcceptDialog(false);

            // Reload after 300ms to sync with backend
            setTimeout(() => {
                loadOffers();
            }, 300);
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (_error: any) {
            console.error('❌ [Offers] Error al aceptar oferta:', _error);
            // Revertir optimistic update
            await loadOffers();
        } finally {
            setActionLoading(false);
            console.groupEnd();
        }
    };

    // Rechazar oferta (con optimistic update)
    const handleRejectOffer = async (offerId: string) => {
        console.group('❌ [Offers] handleRejectOffer');
        try {
            console.log('🔄 [Offers] Rechazando oferta:', offerId);
            setActionLoading(true);

            // Optimistic update
            setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'REJECTED' as OfferStatus } : o)));

            await offersService.rejectOffer(offerId);

            console.log('✅ [Offers] Oferta rechazada exitosamente');
            setShowDetailModal(false);
            setShowRejectDialog(false);

            // Reload after 300ms to sync with backend
            setTimeout(() => {
                loadOffers();
            }, 300);
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (_error: any) {
            console.error('❌ [Offers] Error al rechazar oferta:', _error);
            // Revertir optimistic update
            await loadOffers();
        } finally {
            setActionLoading(false);
            console.groupEnd();
        }
    };

    // Eliminar oferta (con optimistic update)
    const handleDeleteOffer = async (offerId: string) => {
        console.group('🗑️ [Offers] handleDeleteOffer');
        try {
            console.log('🔄 [Offers] Eliminando oferta:', offerId);
            setActionLoading(true);

            // Optimistic update - remover de la lista
            setOffers((prev) => prev.filter((o) => o.id !== offerId));

            await offersService.deleteOffer(offerId);

            console.log('✅ [Offers] Oferta eliminada exitosamente');
            setShowDetailModal(false);
            setShowDeleteDialog(false);

            // Reload after 300ms to sync with backend
            setTimeout(() => {
                loadOffers();
            }, 300);
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (_error: any) {
            console.error('❌ [Offers] Error al eliminar oferta:', _error);
            // Revertir optimistic update
            await loadOffers();
        } finally {
            setActionLoading(false);
            console.groupEnd();
        }
    };

    // Editar oferta
    const handleEditOffer = async (offerId: string, amount: number, message: string) => {
        console.group('✏️ [Offers] handleEditOffer');
        try {
            console.log('🔄 [Offers] Editando oferta:', offerId);
            await offersService.updateOffer({ id: offerId, amount, message });
            console.log('✅ [Offers] Oferta editada exitosamente');
            setShowEditModal(false);

            // Reload after 300ms to sync with backend
            setTimeout(() => {
                loadOffers();
            }, 300);
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (_error: any) {
            console.error('❌ [Offers] Error al editar oferta:', _error);
        } finally {
            console.groupEnd();
        }
    };

    // Crear oferta
    const handleCreateOffer = async (data: { amount: number; message: string; publicationId: string }) => {
        console.group('➕ [Offers] handleCreateOffer');
        try {
            console.log('🔄 [Offers] Creando oferta para publicación:', data.publicationId);
            await offersService.createOffer(data);
            console.log('✅ [Offers] Oferta creada exitosamente');
            setShowCreateModal(false);

            // Reload after 300ms to sync with backend
            setTimeout(() => {
                loadOffers();
            }, 300);
            // biome-ignore lint/suspicious/noExplicitAny: Error handling necesita any
        } catch (error: any) {
            console.error('❌ [Offers] Error al cargar ofertas:', error);
        } finally {
            console.groupEnd();
        }
    };

    // Render item
    const renderOffer = ({ item }: { item: Offer }) => (
        <OfferCard
            offer={item}
            currentUserId={currentUserId}
            currentUserEmail={currentUserEmail}
            onPress={() => {
                setSelectedOffer(item);
                setShowDetailModal(true);
            }}
            onAccept={() => {
                setPendingOfferAction(item.id);
                setShowAcceptDialog(true);
            }}
            onReject={() => {
                setPendingOfferAction(item.id);
                setShowRejectDialog(true);
            }}
            onEdit={() => {
                setSelectedOffer(item);
                setShowEditModal(true);
            }}
            onDelete={() => {
                setPendingOfferAction(item.id);
                setShowDeleteDialog(true);
            }}
            onViewPublication={() => {
                // TODO: Navegar a detalle de publicación
                console.log('[Offers] Ver publicación:', item.publication.id);
            }}
            onOpenChat={() => {
                if (item.conversation) {
                    router.push(`/chat/${item.conversation}` as never);
                } else {
                    console.log('[Offers] No hay conversación activa para esta oferta');
                }
            }}
        />
    );

    // Empty state
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name='file-tray-outline' size={64} color={Colors.gray} />
            <Text style={styles.emptyText}>
                {viewMode === 'received' ? 'No hay ofertas recibidas' : 'No has hecho ofertas aún'}
            </Text>
            <Text style={styles.emptySubtext}>
                {viewMode === 'received'
                    ? 'Las ofertas que recibas aparecerán aquí'
                    : 'Explora publicaciones y haz tu primera oferta'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Ofertas</Text>
            </View>

            {/* View mode selector */}
            <View style={styles.viewModeContainer}>
                <Pressable
                    style={[styles.viewModeButton, viewMode === 'received' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('received')}
                >
                    <Ionicons name='mail-outline' size={20} color={viewMode === 'received' ? '#fff' : Colors.gray} />
                    <Text
                        style={[styles.viewModeButtonText, viewMode === 'received' && styles.viewModeButtonTextActive]}
                    >
                        Recibidas
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.viewModeButton, viewMode === 'sent' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('sent')}
                >
                    <Ionicons name='paper-plane-outline' size={20} color={viewMode === 'sent' ? '#fff' : Colors.gray} />
                    <Text style={[styles.viewModeButtonText, viewMode === 'sent' && styles.viewModeButtonTextActive]}>
                        Enviadas
                    </Text>
                </Pressable>
            </View>

            {/* Status filters */}
            <View style={styles.filtersContainer}>
                {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as FilterStatus[]).map((status) => (
                    <Pressable
                        key={status}
                        style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                            {status === 'ALL'
                                ? 'Todas'
                                : status === 'PENDING'
                                  ? 'Pendientes'
                                  : status === 'ACCEPTED'
                                    ? 'Aceptadas'
                                    : 'Rechazadas'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Lista de ofertas */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={Colors.ecoGreen} />
                </View>
            ) : (
                <FlatList
                    data={filteredOffers}
                    renderItem={renderOffer}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}

            {/* Modales */}
            <OfferDetailModal
                visible={showDetailModal}
                offer={selectedOffer}
                currentUserId={currentUserId}
                onClose={() => setShowDetailModal(false)}
                onAccept={handleAcceptOffer}
                onReject={handleRejectOffer}
                onEdit={(offer) => {
                    setSelectedOffer(offer);
                    setShowDetailModal(false);
                    setShowEditModal(true);
                }}
                onDelete={handleDeleteOffer}
                loading={actionLoading}
            />

            {selectedOffer ? (
                <EditOfferModal
                    visible={showEditModal}
                    offer={selectedOffer}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditOffer}
                />
            ) : null}

            <CreateOfferModal
                visible={showCreateModal}
                publicationId={createModalPublicationId}
                publicationTitle={createModalPublicationTitle}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreateOffer}
            />

            {/* Diálogos de confirmación */}
            <AcceptRejectDialog
                visible={showAcceptDialog}
                title='Aceptar oferta'
                message='¿Estás seguro de aceptar esta oferta? Se notificará al oferente.'
                acceptText='Aceptar'
                rejectText='Rechazar'
                cancelText='Volver'
                onAccept={() => {
                    if (pendingOfferAction) {
                        handleAcceptOffer(pendingOfferAction);
                    }
                }}
                onReject={() => {
                    setShowAcceptDialog(false);
                    setShowRejectDialog(true);
                }}
                onCancel={() => {
                    setShowAcceptDialog(false);
                    setPendingOfferAction(null);
                }}
                loading={actionLoading}
            />

            <ConfirmDialog
                visible={showRejectDialog}
                title='Rechazar oferta'
                message='¿Estás seguro de rechazar esta oferta? Esta acción notificará al oferente.'
                confirmText='Rechazar'
                cancelText='Cancelar'
                onConfirm={() => {
                    if (pendingOfferAction) {
                        handleRejectOffer(pendingOfferAction);
                    }
                }}
                onCancel={() => {
                    setShowRejectDialog(false);
                    setPendingOfferAction(null);
                }}
                loading={actionLoading}
            />

            <ConfirmDialog
                visible={showDeleteDialog}
                title='Eliminar oferta'
                message='¿Estás seguro de eliminar esta oferta? Esta acción no se puede deshacer.'
                confirmText='Eliminar'
                cancelText='Cancelar'
                onConfirm={() => {
                    if (pendingOfferAction) {
                        handleDeleteOffer(pendingOfferAction);
                    }
                }}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setPendingOfferAction(null);
                }}
                loading={actionLoading}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    header: {
        backgroundColor: '#fff',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerTitle: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: Colors.text,
    },
    viewModeContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        backgroundColor: '#fff',
    },
    viewModeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        backgroundColor: '#fff',
    },
    viewModeButtonActive: {
        backgroundColor: Colors.ecoGreen,
        borderColor: Colors.ecoGreen,
    },
    viewModeButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.gray,
    },
    viewModeButtonTextActive: {
        color: '#fff',
    },
    filtersContainer: {
        flexDirection: 'row',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    filterChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.lightGray,
    },
    filterChipActive: {
        backgroundColor: Colors.ecoGreen,
    },
    filterChipText: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: Colors.gray,
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: FontSize.large,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        textAlign: 'center',
    },
});
