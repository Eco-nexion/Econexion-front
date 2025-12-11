import { ConfirmDialog, CreateOfferModal, CreatePostModal, EditPostModal, PostCard } from '@/src/components';
import { offersService } from '@/src/services/offersService';
import { postService } from '@/src/services/postService';
import type { CreateOfferRequest, Post, UpdatePostRequest } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicationsTab() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [offerModalVisible, setOfferModalVisible] = useState(false);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

    // Obtener email del usuario actual al montar
    useEffect(() => {
        const loadUserEmail = async () => {
            const email = await storage.getItem(STORAGE_KEYS.user_email);
            const token = await storage.getItem(STORAGE_KEYS.token);

            console.log('🔐 [Publications] Storage Debug:', {
                email: email || 'NO EMAIL',
                token: token ? `${token.substring(0, 30)}...` : 'NO TOKEN',
                tokenLength: token?.length || 0,
            });

            setCurrentUserEmail(email || '');
        };
        loadUserEmail();
    }, []);

    const loadPosts = useCallback(async (silent = false) => {
        try {
            console.log(`📱 [Publications] Cargando publicaciones... (silent: ${silent})`);
            if (!silent) setLoading(true);
            const data = await postService.getAllPosts();
            console.log('📱 [Publications] Posts cargados:', data.length);
            setPosts(data);
        } catch (error: any) {
            console.error('📱 [Publications] Error cargando posts:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsUpdating(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Carga inicial al enfocar si tenemos usuario
            if (currentUserEmail) {
                // Opcional: Recargar al enfocar si se desea actualización inmediata
                // loadPosts(true); 
            }

            // Auto-refresh cada 10 segundos
            const intervalId = setInterval(() => {
                if (currentUserEmail) {
                    console.log('🔄 [Auto-Refresh] Actualizando feed (Tab Activo)...');
                    loadPosts(true);
                }
            }, 5000);

            console.log('👁️ [Publications] Tab enfocado - Iniciando auto-refresh');

            return () => {
                console.log('🙈 [Publications] Tab desenfocado - Deteniendo auto-refresh');
                clearInterval(intervalId);
            };
        }, [currentUserEmail, loadPosts])
    );

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
        try {
            console.log('📱 [Publications] Creando nueva publicación:', data.title);
            await postService.createPost(data);
            console.log('📱 [Publications] Post creado exitosamente');

            await loadPosts(); // Recargar lista
            console.log('✅ [Publications] Tu publicación ha sido creada correctamente');
        } catch (error: any) {
            console.error('📱 [Publications] Error creando post:', error.message);

            // Re-lanzar el error para que el modal lo maneje si es necesario
            throw error;
        }
    };

    const handlePostPress = (post: Post) => {
        // Si es mi propia publicación, no puedo hacer oferta
        if (post.ownerEmail === currentUserEmail) {
            console.log('ℹ️ [Publications] No puedes hacer ofertas en tus propias publicaciones');
            return;
        }

        // Abrir modal para hacer oferta
        setSelectedPost(post);
        setOfferModalVisible(true);
    };

    const handleCreateOffer = async (data: CreateOfferRequest) => {
        try {
            await offersService.createOffer(data);
            console.log('✅ [Publications] Tu oferta ha sido enviada correctamente');
            setOfferModalVisible(false);
            setSelectedPost(null);
        } catch (_error) {
            throw new Error('No se pudo enviar la oferta. Intenta de nuevo.');
        }
    };

    const handleEditPost = (post: Post) => {
        console.log('📱 [Publications] Editando publicación:', post.id);
        setSelectedPost(post);
        setEditModalVisible(true);
    };

    const handleUpdatePost = async (data: UpdatePostRequest) => {
        console.log('📱 [Publications] ===== INICIANDO ACTUALIZACIÓN =====');
        console.log('📱 [Publications] Datos recibidos del modal:', JSON.stringify(data, null, 2));
        console.log(
            '📱 [Publications] Estado actual de posts ANTES de actualizar:',
            posts.map((p) => ({
                id: p.id,
                title: p.title,
                quantity: p.quantity,
                price: p.price,
            }))
        );

        try {
            console.log('📱 [Publications] Llamando a postService.updatePost...');
            const result = await postService.updatePost(data);
            console.log('📱 [Publications] ✅ Resultado de updatePost:', JSON.stringify(result, null, 2));
            console.log('📱 [Publications] Backend respondió exitosamente, esperando 500ms antes de recargar...');

            // Pequeño delay para asegurar que el backend termine de procesar
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log('📱 [Publications] Recargando lista de publicaciones...');
            await loadPosts();

            console.log(
                '📱 [Publications] Estado de posts DESPUÉS de recargar:',
                posts.map((p) => ({
                    id: p.id,
                    title: p.title,
                    quantity: p.quantity,
                    price: p.price,
                }))
            );

            console.log('✅ [Publications] Tu publicación ha sido actualizada correctamente');
            console.log('📱 [Publications] ===== ACTUALIZACIÓN COMPLETADA =====');
        } catch (error: any) {
            console.error('📱 [Publications] ===== ERROR EN ACTUALIZACIÓN =====');
            console.error('📱 [Publications] Error completo:', error);
            console.error('📱 [Publications] Error.name:', error?.name);
            console.error('📱 [Publications] Error.message:', error?.message);
            console.error('📱 [Publications] Error.stack:', error?.stack);
            console.error('📱 [Publications] typeof error:', typeof error);
            console.error('📱 [Publications] Error stringified:', JSON.stringify(error, null, 2));

            const errorMessage = error?.message || 'No se pudo actualizar la publicación';
            console.error('📱 [Publications] Mensaje de error para mostrar:', errorMessage);
            console.log('📱 [Publications] ===== FIN ERROR =====');

            throw error;
        }
    };

    const handleDeletePost = (post: Post) => {
        console.log('📱 [Publications] Solicitando confirmación para eliminar:', {
            id: post.id,
            title: post.title,
        });
        setPostToDelete(post);
        setConfirmDeleteVisible(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;

        console.log('📱 [Publications] ===== INICIANDO ELIMINACIÓN =====');
        const postId = postToDelete.id;
        const postTitle = postToDelete.title;
        setConfirmDeleteVisible(false);
        setPostToDelete(null);

        try {
            console.log('📱 [Publications] Eliminando post:', { id: postId, title: postTitle });
            await postService.deletePost(postId);
            console.log('📱 [Publications] ✅ Post eliminado exitosamente del backend');

            // Recargar la lista completa del backend
            console.log('📱 [Publications] Recargando lista de publicaciones...');
            await loadPosts();
            console.log('📱 [Publications] Lista actualizada después de eliminar');
            console.log('✅ Publicación eliminada correctamente');

            console.log('📱 [Publications] ===== ELIMINACIÓN COMPLETADA =====');
        } catch (error: any) {
            console.error('📱 [Publications] Error al eliminar:', error);
            // Si falla, recargar la lista para restaurar el estado correcto
            await loadPosts();
        }
    };

    const cancelDelete = () => {
        console.log('📱 [Publications] Eliminación cancelada');
        setConfirmDeleteVisible(false);
        setPostToDelete(null);
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name='newspaper-outline' size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No hay publicaciones</Text>
            <Text style={styles.emptySubtitle}>Sé el primero en publicar material reciclable</Text>
        </View>
    );

    const renderPost = ({ item }: { item: Post }) => {
        const isMyPost = item.ownerEmail === currentUserEmail;

        console.log('📝 [Publications] Renderizando post:', {
            postId: item.id,
            title: item.title,
            owner: item.owner,
            ownerEmail: item.ownerEmail,
            currentUserEmail,
            isMyPost,
        });

        return (
            <View style={styles.postContainer}>
                <PostCard
                    post={item}
                    onPress={() => handlePostPress(item)}
                    showActions={isMyPost}
                    onEdit={() => {
                        console.log('🟢 [Publications] onEdit llamado para:', item.title);
                        handleEditPost(item);
                    }}
                    onDelete={() => {
                        console.log('🟢 [Publications] onDelete llamado para:', item.title);
                        handleDeletePost(item);
                    }}
                />
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
                <View style={styles.headerBar}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Publicaciones</Text>
                    </View>
                    <Pressable
                        onPress={() => {
                            setIsUpdating(true);
                            loadPosts(false);
                        }}
                        style={({ pressed }) => [
                            styles.refreshButton,
                            pressed && { opacity: 0.7 },
                            isUpdating && { opacity: 0.5 }
                        ]}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="refresh" size={24} color="#fff" />
                        )}
                    </Pressable>
                </View>

                {loading && !refreshing && !isUpdating ? (
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

                {/* Botón crear publicación */}
                <Pressable style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
                    <Ionicons name='add-circle' size={24} color='#fff' />
                    <Text style={styles.createButtonText}>Crear Publicación</Text>
                </Pressable>
            </View>

            <CreatePostModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSave={handleCreatePost}
            />

            <EditPostModal
                visible={editModalVisible}
                post={selectedPost}
                onClose={() => {
                    setEditModalVisible(false);
                    setSelectedPost(null);
                }}
                onSave={handleUpdatePost}
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

            <ConfirmDialog
                visible={confirmDeleteVisible}
                title='Confirmar eliminación'
                message={`¿Estás seguro de eliminar "${postToDelete?.title}"? Esta acción no se puede deshacer.`}
                confirmText='Eliminar'
                cancelText='Cancelar'
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
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
    createButton: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.ecoGreen,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonText: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: '#fff',
    },

    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.ecoGreen,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: '#fff',
    },
    refreshButton: {
        padding: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
