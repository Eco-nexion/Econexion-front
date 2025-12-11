import { aiChatService, type UserDataForAI } from '@/src/services/aiChatService';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

interface AIChatModalProps {
    visible: boolean;
    onClose: () => void;
    userData: UserDataForAI | null;
}

/**
 * Modal de chat con IA
 * Permite hacer preguntas sobre publicaciones y ofertas del usuario
 */
export default function AIChatModal({ visible, onClose, userData }: AIChatModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Verificar disponibilidad del servidor al abrir
    useEffect(() => {
        if (visible) {
            checkServer();
            loadSuggestions();
        }
    }, [visible, userData]);

    const checkServer = async () => {
        const available = await aiChatService.healthCheck();
        setIsServerAvailable(available);
        
        if (!available) {
            // Agregar mensaje de error si el servidor no está disponible
            addAIMessage('⚠️ El servidor de IA no está disponible. Asegúrate de que el backend esté corriendo en http://localhost:8000');
        } else if (messages.length === 0) {
            // Mensaje de bienvenida
            addAIMessage(`¡Hola ${userData?.username || 'usuario'}! 👋\n\nSoy tu asistente de Econexion. Puedo ayudarte a:\n\n• Ver el estado de tus publicaciones\n• Consultar ofertas recibidas y enviadas\n• Darte un resumen de tu actividad\n\n¿En qué puedo ayudarte hoy?`);
        }
    };

    const loadSuggestions = async () => {
        if (userData) {
            const sug = await aiChatService.getSuggestions(userData);
            setSuggestions(sug);
        }
    };

    const addAIMessage = (text: string) => {
        const newMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSend = useCallback(async (textToSend?: string) => {
        const messageText = textToSend || inputText.trim();
        if (!messageText || isLoading || !userData) return;

        // Agregar mensaje del usuario
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: messageText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Scroll al final
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            // Llamar al servicio de chat IA
            const response = await aiChatService.sendMessage(messageText, userData);
            addAIMessage(response);
        } catch (error) {
            console.error('Error sending message:', error);
            addAIMessage('❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
            // Scroll al final después de la respuesta
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [inputText, isLoading, userData]);

    const handleSuggestionPress = (suggestion: string) => {
        handleSend(suggestion);
    };

    const handleClose = () => {
        setMessages([]);
        setSuggestions([]);
        setIsServerAvailable(null);
        onClose();
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isUser = item.role === 'user';
        
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                {!isUser && (
                    <View style={styles.aiIcon}>
                        <Ionicons name='sparkles' size={16} color='#6366F1' />
                    </View>
                )}
                <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
                        {item.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    const renderSuggestions = () => {
        if (suggestions.length === 0 || messages.length > 1) return null;
        
        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                <View style={styles.suggestionsList}>
                    {suggestions.map((suggestion, index) => (
                        <Pressable
                            key={index}
                            style={styles.suggestionChip}
                            onPress={() => handleSuggestionPress(suggestion)}
                        >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            presentationStyle='pageSheet'
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.aiAvatar}>
                            <Ionicons name='sparkles' size={20} color='#fff' />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Asistente Econexion</Text>
                            <Text style={styles.headerSubtitle}>
                                {isServerAvailable === false ? '🔴 Desconectado' : '🟢 En línea'}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name='close' size={24} color={Colors.text} />
                    </Pressable>
                </View>

                {/* Chat Messages */}
                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={renderSuggestions}
                    />

                    {/* Loading indicator */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.loadingBubble}>
                                <ActivityIndicator size='small' color='#6366F1' />
                                <Text style={styles.loadingText}>Pensando...</Text>
                            </View>
                        </View>
                    )}

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder='Escribe tu pregunta...'
                            placeholderTextColor={Colors.gray}
                            multiline
                            maxLength={500}
                            editable={isServerAvailable !== false && !isLoading}
                        />
                        <Pressable
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading || isServerAvailable === false) && styles.sendButtonDisabled,
                            ]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading || isServerAvailable === false}
                        >
                            <Ionicons
                                name='send'
                                size={20}
                                color={inputText.trim() && !isLoading ? '#fff' : Colors.gray}
                            />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    aiAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
    },
    userBubble: {
        justifyContent: 'flex-end',
    },
    aiBubble: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    aiIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
        marginTop: 4,
    },
    messageContent: {
        maxWidth: '80%',
        padding: Spacing.sm,
        borderRadius: BorderRadius.large,
    },
    userContent: {
        backgroundColor: '#6366F1',
        borderBottomRightRadius: 4,
    },
    aiContent: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    messageText: {
        fontSize: FontSize.medium,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: Colors.text,
    },
    timestamp: {
        fontSize: 10,
        marginTop: Spacing.xs / 2,
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    aiTimestamp: {
        color: Colors.gray,
    },
    loadingContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: '#fff',
        padding: Spacing.sm,
        borderRadius: BorderRadius.large,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    loadingText: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    suggestionsContainer: {
        marginTop: Spacing.md,
        padding: Spacing.sm,
        backgroundColor: '#EEF2FF',
        borderRadius: BorderRadius.medium,
    },
    suggestionsTitle: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: '#6366F1',
        marginBottom: Spacing.xs,
    },
    suggestionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    suggestionChip: {
        backgroundColor: '#fff',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    suggestionText: {
        fontSize: FontSize.small,
        color: '#6366F1',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.lightGray,
    },
});