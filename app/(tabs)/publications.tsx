import { CreateOfferModal, CreatePostModal, PostCard } from '@/src/components';
import { offersService } from '@/src/services/offersService';
import { postService } from '@/src/services/postService';
import type { CreateOfferRequest, Post } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicationsTab() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [offerModalVisible, setOfferModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Obtener userId al montar
    useEffect(() => {
        const loadUserId = async () => {
            const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-id-123';
            setCurrentUserId(userId);
        };
        loadUserId();
    }, []);

    const loadPosts = useCallback(async () => {
        try {
            const data = await postService.getAllPosts();
            setPosts(data);
        } catch (_error) {
            Alert.alert('Error', 'No se pudieron cargar las publicaciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserId) {
            loadPosts();
        }
    }, [currentUserId, loadPosts]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };

    const handleCreatePost = async (data: {
        title: string;
        material: string;
        quantity: number;
        price: number;
        location: string;
        description: string;
    }) => {
        await postService.createPost(data);
        await loadPosts(); // Recargar lista
    };

    const handlePostPress = (post: Post) => {
        // Si es mi propia publicación, no puedo hacer oferta
        if (post.owner === currentUserId) {
            Alert.alert('Información', 'No puedes hacer ofertas en tus propias publicaciones');
            return;
        }

        // Abrir modal para hacer oferta
        setSelectedPost(post);
        setOfferModalVisible(true);
    };

    const handleCreateOffer = async (data: CreateOfferRequest) => {
        try {
            await offersService.createOffer(data);
            Alert.alert('¡Éxito!', 'Tu oferta ha sido enviada correctamente');
            setOfferModalVisible(false);
            setSelectedPost(null);
        } catch (_error) {
            throw new Error('No se pudo enviar la oferta. Intenta de nuevo.');
        }
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name='newspaper-outline' size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No hay publicaciones</Text>
            <Text style={styles.emptySubtitle}>Sé el primero en publicar material reciclable</Text>
        </View>
    );

    const renderPost = ({ item }: { item: Post }) => {
        const isMyPost = item.owner === currentUserId;

        return (
            <View style={styles.postContainer}>
                <PostCard post={item} onPress={() => handlePostPress(item)} />
                {isMyPost ? null : (
                    <Pressable
                        style={styles.offerButton}
                        onPress={() => {
                            setSelectedPost(item);
                            setOfferModalVisible(true);
                        }}
                    >
                        <Ionicons name='pricetag' size={18} color='#fff' />
                        <Text style={styles.offerButtonText}>Hacer Oferta</Text>
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size='large' color={Colors.ecoGreen} />
                        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPost}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmpty}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[Colors.ecoGreen]}
                                tintColor={Colors.ecoGreen}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* FAB - Botón flotante */}
                <Pressable style={styles.fab} onPress={() => setCreateModalVisible(true)}>
                    <Ionicons name='add' size={28} color='#fff' />
                </Pressable>
            </View>

            <CreatePostModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSave={handleCreatePost}
            />

            {selectedPost ? (
                <CreateOfferModal
                    visible={offerModalVisible}
                    publicationId={selectedPost.id}
                    publicationTitle={selectedPost.title}
                    onClose={() => {
                        setOfferModalVisible(false);
                        setSelectedPost(null);
                    }}
                    onSave={handleCreateOffer}
                />
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: FontSize.medium,
        color: Colors.gray,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 80, // Espacio para el FAB
    },
    postContainer: {
        marginBottom: Spacing.md,
    },
    offerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.ecoGreen,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.medium,
        marginTop: -Spacing.sm,
        marginHorizontal: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    offerButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
        gap: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
    },
    emptySubtitle: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.ecoGreen,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
