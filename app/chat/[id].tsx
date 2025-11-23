import { chatService } from '@/src/services';
import type { Message } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const conversationId = Number.parseInt(id || '0', 10);

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [currentUserId, setCurrentUserId] = useState<number>(0);
    const flatListRef = useRef<FlatList>(null);

    // Cargar userId
    useEffect(() => {
        const loadUserId = async () => {
            const _userIdStr = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-id-123';
            setCurrentUserId(123);
        };
        loadUserId();
    }, []);

    // Cargar mensajes
    const loadMessages = useCallback(async () => {
        if (!conversationId) {
            return;
        }
        if (!currentUserId) {
            return;
        }

        try {
            setLoading(true);
            const data = await chatService.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            Alert.alert('Error', 'No se pudieron cargar los mensajes');
        } finally {
            setLoading(false);
        }
    }, [conversationId, currentUserId]);

    useEffect(() => {
        if (currentUserId) {
            loadMessages();
        }
    }, [currentUserId, loadMessages]);

    // Enviar mensaje
    const handleSend = async () => {
        if (!messageText.trim() || sending) {
            return;
        }

        try {
            setSending(true);
            const newMessage = await chatService.sendMessage(conversationId, {
                senderId: currentUserId,
                text: messageText.trim(),
            });

            setMessages((prev) => [...prev, newMessage]);
            setMessageText('');

            // Scroll al final
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            Alert.alert('Error', 'No se pudo enviar el mensaje');
        } finally {
            setSending(false);
        }
    };

    // Placeholder para adjuntos
    const handleAttachment = () => {
        Alert.alert('Próximamente', 'Pronto podrás adjuntar fotos del material');
    };

    // Placeholder para menú
    const handleMenu = () => {
        Alert.alert('Opciones', 'Selecciona una opción', [
            { text: 'Ver Oferta', onPress: () => Alert.alert('Ver Oferta', 'Funcionalidad pendiente') },
            {
                text: 'Reportar',
                style: 'destructive',
                onPress: () => Alert.alert('Reportar', 'Funcionalidad pendiente'),
            },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };

    // Formatear fecha para agrupación
    const formatMessageDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        }
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Formatear hora
    const formatTime = (isoDate: string): string => {
        const date = new Date(isoDate);
        return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    };

    // Agrupar mensajes por día
    const groupedMessages = messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
        const dateStr = formatMessageDate(message.createdAt);
        const existingGroup = groups.find((g) => g.date === dateStr);

        if (existingGroup) {
            existingGroup.messages.push(message);
        } else {
            groups.push({ date: dateStr, messages: [message] });
        }

        return groups;
    }, []);

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === currentUserId;

        return (
            <View
                style={[
                    styles.messageBubbleContainer,
                    isMine ? styles.myMessageContainer : styles.otherMessageContainer,
                ]}
            >
                <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.otherMessage]}>
                    <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.otherMessageTime]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderDateSeparator = (date: string) => (
        <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.dateLine} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: `Empresa ${conversationId}`,
                    headerStyle: { backgroundColor: Colors.ecoGreen },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                    headerRight: () => (
                        <Pressable onPress={handleMenu} style={styles.menuButton}>
                            <Ionicons name='ellipsis-vertical' size={24} color='#fff' />
                        </Pressable>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Banner con info de oferta - placeholder */}
                <Pressable
                    style={styles.offerBanner}
                    onPress={() => Alert.alert('Ver Oferta', 'Funcionalidad pendiente')}
                >
                    <View style={styles.offerInfo}>
                        <Ionicons name='pricetag' size={20} color={Colors.ecoGreen} />
                        <View style={styles.offerTextContainer}>
                            <Text style={styles.offerTitle}>Oferta: Material Reciclable</Text>
                            <Text style={styles.offerAmount}>Monto: $3,200</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: Colors.cyan }]}>
                        <Text style={styles.statusText}>PENDIENTE</Text>
                    </View>
                </Pressable>

                {/* Lista de mensajes */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size='large' color={Colors.ecoGreen} />
                        <Text style={styles.loadingText}>Cargando mensajes...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={groupedMessages}
                        keyExtractor={(_item, index) => `group-${index}`}
                        renderItem={({ item: group }) => (
                            <View>
                                {renderDateSeparator(group.date)}
                                {group.messages.map((msg: Message) => (
                                    <View key={msg.id}>{renderMessage({ item: msg })}</View>
                                ))}
                            </View>
                        )}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                )}

                {/* Input de mensaje */}
                <View style={styles.inputContainer}>
                    <Pressable style={styles.attachButton} onPress={handleAttachment}>
                        <Ionicons name='attach' size={24} color={Colors.gray} />
                    </Pressable>
                    <TextInput
                        style={styles.input}
                        placeholder='Escribe un mensaje...'
                        placeholderTextColor={Colors.gray}
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!messageText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size='small' color='#fff' />
                        ) : (
                            <Ionicons name='paper-plane' size={20} color='#fff' />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    menuButton: {
        padding: Spacing.xs,
        marginRight: Spacing.xs,
    },
    offerBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    offerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    offerTextContainer: {
        flex: 1,
    },
    offerTitle: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: Colors.text,
    },
    offerAmount: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs / 2,
        borderRadius: BorderRadius.small,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
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
    messagesList: {
        padding: Spacing.md,
    },
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.lightGray,
    },
    dateText: {
        fontSize: FontSize.small - 2,
        color: Colors.gray,
        marginHorizontal: Spacing.sm,
        fontWeight: '600',
    },
    messageBubbleContainer: {
        marginBottom: Spacing.sm,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: Spacing.sm,
        borderRadius: BorderRadius.medium,
    },
    myMessage: {
        backgroundColor: Colors.ecoGreen,
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: Colors.lightGray,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: FontSize.medium,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    otherMessageText: {
        color: Colors.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: Spacing.xs / 2,
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: Colors.gray,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.sm,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
        gap: Spacing.xs,
    },
    attachButton: {
        padding: Spacing.xs,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: BorderRadius.large,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.medium,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: Colors.ecoGreen,
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.gray,
        opacity: 0.5,
    },
});
