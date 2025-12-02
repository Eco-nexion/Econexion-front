import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    TextInput,
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
import {Offer} from "@type/offer";
import {Post} from "@type/post";

export default function RecyclerDashboard() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
    const [completedOffers, setCompletedOffers] = useState<Offer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allPosts, sentOffers] = await Promise.all([
                PostsService.getPosts(),
                OffersService.getSentOffers(),
            ]);
            setPosts(allPosts);
            const pending = sentOffers.filter(o => o.status === 'PENDING');
            const completed = sentOffers.filter(o => o.status === 'ACCEPTED' || o.status === 'REJECTED');
            setPendingOffers(pending);
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

    const handleUpdateOffer = (offerId: string) => {
        // Router to update
    };

    const handleDeleteOffer = async (offerId: string) => {
        await OffersService.deleteOffer(offerId);
        loadData();
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.material.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Pressable style={styles.menuBtn}>
                    <MaterialIcons name="menu" size={24} color="#111" />
                </Pressable>
                <Text style={styles.headerTitle}>Panel de Control</Text>
                <View style={styles.headerActions}>
                    <View style={{ width: 40 }} />
                    <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Lotes Publicados */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lotes Publicados</Text>

                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color={Colors.ecoGreen} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar lotes"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {filteredPosts.length === 0 ? (
                        <Text style={styles.emptyText}>No hay lotes disponibles</Text>
                    ) : (
                        filteredPosts.slice(0, 5).map((post) => (
                            <PostCard key={post.id} post={post} onPress={() => router.push(`/dashboard/post-detail?id=${post.id}`)} />
                        ))
                    )}
                </View>

                {/* Ofertas Pendientes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ofertas Pendientes</Text>
                    {pendingOffers.length === 0 ? (
                        <Text style={styles.emptyText}>No tienes ofertas pendientes</Text>
                    ) : (
                        pendingOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} onPress={() => router.push(`/dashboard/offer-detail?id=${offer.id}`)}
                                       onUpdate={() => handleUpdateOffer(offer.id)} onDelete={() => handleDeleteOffer(offer.id)} />
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
    },
    menuBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
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
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
        marginBottom: Spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6f8f6',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: FontSize.medium,
        color: '#111',
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
});