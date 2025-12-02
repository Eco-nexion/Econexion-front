import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize } from '@/src/constants';
import { PostsService } from '@/src/services/postsService';
import { OffersService } from '@/src/services/offersService';
import PostCard from '@/src/components/PostCard';
import OfferCard from '@/src/components/OfferCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import {Post} from "@type/post";
import {Offer} from "@type/offer";


export default function GeneratorDashboard() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
    const [completedOffers, setCompletedOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [posts, offers] = await Promise.all([
                PostsService.getMyPosts(),
                OffersService.getReceivedOffers(),
            ]);
            setMyPosts(posts);
            const pending = offers.filter(o => o.status === 'PENDING');
            const completed = offers.filter(o => o.status === 'ACCEPTED' || o.status === 'REJECTED');
            setReceivedOffers(pending);
            setCompletedOffers(completed);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = async () => {
        await signOut();
    };

    const handleEditPost = (postId: string) => {
        // Router to edit screen
    };

    const handleDeletePost = async (postId: string) => {
        await PostsService.deletePost(postId);
        loadData();
    };

    const handleAcceptOffer = async (offerId: string) => {
        const offer = receivedOffers.find(o => o.id === offerId);
        if (offer) {
            offer.status = 'ACCEPTED';
            await OffersService.updateOffer(offer);
            loadData();
        }
    };

    const handleRejectOffer = async (offerId: string) => {
        const offer = receivedOffers.find(o => o.id === offerId);
        if (offer) {
            offer.status = 'REJECTED';
            await OffersService.updateOffer(offer);
            loadData();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.ecoGreen} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Econexión</Text>
                <View style={styles.headerActions}>
                    <Pressable style={styles.notificationBtn}>
                        <MaterialIcons name="notifications" size={24} color={Colors.gray} />
                    </Pressable>
                    <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.mainTitle}>Panel de Control</Text>

                {/* Create Post Card */}
                <View style={styles.createPostCard}>
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2LCO_sG-Pmu9Z7ew20FLtWYIawbEgIr9s_rb2JOWGkLp09BtnwdLpHtR-GM4wbpWPml5ZXJ9FleW6dvTGFrgmYrsIwUK9ML-v-jf5h9QFqlPGXVMcUCHDEJr8bCOXIE5v_l-2T6PAoH8b9GqmNaty9BoTZo9bU_5Y1lk0KjUrx-mU5jA1nPuVc2wQzsm47hO7oSMNJlkN2TqT_CSq8UfJKn0vGX4Lg7Z95ZDEKDqeznGFOGCOVVjTLKM10qkB_y9-FnYBCJ1XBbFh' }}
                        style={styles.createPostImage}
                    />
                    <View style={styles.createPostContent}>
                        <Text style={styles.createPostTitle}>Publicar Lote</Text>
                        <Text style={styles.createPostSubtitle}>Crea una nueva publicación para tus residuos y encuentra compradores.</Text>
                        <Pressable style={styles.createBtn} onPress={() => router.push('/dashboard/publish')}>
                            <Text style={styles.createBtnText}>Crear</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Mis Lotes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mis Lotes</Text>
                    {myPosts.length === 0 ? (
                        <Text style={styles.emptyText}>No tienes lotes publicados</Text>
                    ) : (
                        myPosts.map((post) => (
                            <PostCard key={post.id} post={post} onPress={() => router.push(`/dashboard/post-detail?id=${post.id}`)}
                                      onEdit={() => handleEditPost(post.id)} onDelete={() => handleDeletePost(post.id)} />
                        ))
                    )}
                </View>

                {/* Ofertas Recibidas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ofertas Recibidas</Text>
                    {receivedOffers.length === 0 ? (
                        <Text style={styles.emptyText}>No tienes ofertas pendientes</Text>
                    ) : (
                        receivedOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} onPress={() => router.push(`/dashboard/offer-detail?id=${offer.id}`)}
                                       onAccept={() => handleAcceptOffer(offer.id)} onReject={() => handleRejectOffer(offer.id)} />
                        ))
                    )}
                </View>

                {/* Ofertas Terminadas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ofertas Terminadas</Text>
                    {completedOffers.length === 0 ? (
                        <Text style={styles.emptyText}>No hay ofertas terminadas</Text>
                    ) : (
                        completedOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} onPress={() => router.push(`/dashboard/offer-detail?id=${offer.id}`)} />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: '#f6f8f6cc',
        borderBottomWidth: 1,
        borderBottomColor: '#20df2633',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    notificationBtn: {
        padding: 8,
        borderRadius: 20,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
    },
    logoutText: {
        fontSize: FontSize.small,
        color: '#111',
        fontWeight: '600',
    },
    container: {
        flex: 1,
        padding: Spacing.lg,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
        marginBottom: Spacing.lg,
    },
    createPostCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    createPostImage: {
        width: '100%',
        height: 160,
    },
    createPostContent: {
        padding: Spacing.lg,
    },
    createPostTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    createPostSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: Spacing.md,
    },
    createBtn: {
        backgroundColor: Colors.ecoGreen,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    createBtnText: {
        color: '#000',
        fontWeight: '700',
        fontSize: FontSize.medium,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: Spacing.md,
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
});