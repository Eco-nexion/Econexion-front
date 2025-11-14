import CreateOfferModal from '@/src/components/CreateOfferModal';
import EditOfferModal from '@/src/components/EditOfferModal';
import OfferCard from '@/src/components/OfferCard';
import OfferDetailModal from '@/src/components/OfferDetailModal';
import { offersService } from '@/src/services/offersService';
import type { Offer, OfferStatus } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'received' | 'sent';
type FilterStatus = OfferStatus | 'ALL';

export default function HomeTab() {
    const [currentUserId, setCurrentUserId] = useState<string>('');
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

    // Obtener userId al montar
    useEffect(() => {
        const getUserId = async () => {
            const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-1';
            setCurrentUserId(userId);
        };
        getUserId();
    }, []);

    // Cargar ofertas
    const loadOffers = useCallback(async () => {
        try {
            setLoading(true);
            const data =
                viewMode === 'received' ? await offersService.getReceivedOffers() : await offersService.getMyOffers();
            setOffers(data);
        } catch (error) {
            console.error('Error loading offers:', error);
            Alert.alert('Error', 'No se pudieron cargar las ofertas');
        } finally {
            setLoading(false);
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

    // Aceptar oferta
    const handleAcceptOffer = async (offerId: string) => {
        try {
            setActionLoading(true);
            await offersService.acceptOffer(offerId);
            Alert.alert('Éxito', 'Oferta aceptada correctamente');
            setShowDetailModal(false);
            await loadOffers();
        } catch (_error) {
            Alert.alert('Error', 'No se pudo aceptar la oferta');
        } finally {
            setActionLoading(false);
        }
    };

    // Rechazar oferta
    // biome-ignore lint/suspicious/useAwait: <>
    const handleRejectOffer = async (offerId: string) => {
        Alert.alert('Rechazar oferta', '¿Estás seguro de rechazar esta oferta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Rechazar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        await offersService.rejectOffer(offerId);
                        Alert.alert('Oferta rechazada');
                        setShowDetailModal(false);
                        await loadOffers();
                    } catch (_error) {
                        Alert.alert('Error', 'No se pudo rechazar la oferta');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    // Eliminar oferta
    // biome-ignore lint/suspicious/useAwait: <>
    const handleDeleteOffer = async (offerId: string) => {
        Alert.alert('Eliminar oferta', '¿Estás seguro de eliminar esta oferta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        await offersService.deleteOffer(offerId);
                        Alert.alert('Oferta eliminada');
                        setShowDetailModal(false);
                        await loadOffers();
                    } catch (_error) {
                        Alert.alert('Error', 'No se pudo eliminar la oferta');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    // Editar oferta
    const handleEditOffer = async (offerId: string, amount: number, message: string) => {
        try {
            await offersService.updateOffer({ id: offerId, amount, message });
            Alert.alert('Éxito', 'Oferta actualizada correctamente');
            setShowEditModal(false);
            await loadOffers();
        } catch (_error) {
            Alert.alert('Error', 'No se pudo actualizar la oferta');
        }
    };

    // Crear oferta (placeholder para cuando lo conectes)
    const handleCreateOffer = async (data: { amount: number; message: string; publicationId: string }) => {
        try {
            await offersService.createOffer(data);
            Alert.alert('Éxito', 'Oferta creada correctamente');
            setShowCreateModal(false);
            await loadOffers();
        } catch (_error) {
            Alert.alert('Error', 'No se pudo crear la oferta');
        }
    };

    // Render item
    const renderOffer = ({ item }: { item: Offer }) => (
        <OfferCard
            offer={item}
            currentUserId={currentUserId}
            onPress={() => {
                setSelectedOffer(item);
                setShowDetailModal(true);
            }}
            onAccept={() => handleAcceptOffer(item.id)}
            onReject={() => handleRejectOffer(item.id)}
            onEdit={() => {
                setSelectedOffer(item);
                setShowEditModal(true);
            }}
            onDelete={() => handleDeleteOffer(item.id)}
            onViewPublication={() => {
                // TODO: Navegar a detalle de publicación
                Alert.alert('Ver publicación', 'Funcionalidad pendiente');
            }}
            onOpenChat={() => {
                // TODO: Navegar a chat
                Alert.alert('Chat', 'Funcionalidad pendiente');
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
                <Text style={styles.headerTitle}>Feed de Ofertas</Text>
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
