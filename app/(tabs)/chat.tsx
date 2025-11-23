import { ConversationCard } from '@/src/components';
import { chatService } from '@/src/services';
import type { ConversationSummary } from '@/src/types';
import { Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatTab() {
    const router = useRouter();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number>(0);

    // Cargar userId al montar
    useEffect(() => {
        const loadUserId = async () => {
            const _userIdStr = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-id-123';
            // Convertir a número (simplificación para el mock)
            setCurrentUserId(123);
        };
        loadUserId();
    }, []);

    // Cargar conversaciones
    const loadConversations = useCallback(async () => {
        if (!currentUserId) {
            return;
        }

        try {
            setLoading(true);
            const data = await chatService.getConversations(currentUserId);
            setConversations(data);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las conversaciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        if (currentUserId) {
            loadConversations();
        }
    }, [currentUserId, loadConversations]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadConversations();
    };

    const handleConversationPress = (conversation: ConversationSummary) => {
        router.push(`/chat/${conversation.conversationId}`);
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name='chatbubbles-outline' size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No tienes conversaciones activas</Text>
            <Text style={styles.emptySubtitle}>Las conversaciones aparecen cuando negocias ofertas</Text>
        </View>
    );

    const renderConversation = ({ item }: { item: ConversationSummary }) => (
        <ConversationCard
            conversation={item}
            currentUserId={currentUserId}
            onPress={() => handleConversationPress(item)}
            otherParticipantName={`Empresa ${item.participant1Id === currentUserId ? item.participant2Id : item.participant1Id}`}
            offerInfo={{
                material: 'Material',
                status: 'PENDING',
            }}
        />
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mis Conversaciones</Text>
                    {/* Placeholder: botón de búsqueda */}
                    <Pressable
                        style={styles.searchButton}
                        onPress={() => Alert.alert('Búsqueda', 'Funcionalidad próximamente')}
                    >
                        <Ionicons name='search-outline' size={24} color={Colors.ecoGreen} />
                    </Pressable>
                </View>

                {/* Lista de conversaciones */}
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size='large' color={Colors.ecoGreen} />
                        <Text style={styles.loadingText}>Cargando conversaciones...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={conversations}
                        keyExtractor={(item) => item.conversationId.toString()}
                        renderItem={renderConversation}
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
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerTitle: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
    },
    searchButton: {
        padding: Spacing.xs,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        textAlign: 'center',
    },
});
