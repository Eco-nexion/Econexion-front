import type { ConversationSummary, CreateConversationRequest, Message, SendMessageRequest } from '@/src/types';

// Mock data para desarrollo
const MOCK_CONVERSATIONS: ConversationSummary[] = [
    {
        conversationId: 1,
        offerId: 1,
        participant1Id: 123,
        participant2Id: 2,
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        lastMessagePreview: '¿Cuándo puedes recoger el material?',
        preview: '¿Cuándo puedes recoger el material?',
    },
    {
        conversationId: 2,
        offerId: 2,
        participant1Id: 123,
        participant2Id: 3,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastMessagePreview: 'Perfecto, acepto tu oferta',
        preview: 'Perfecto, acepto tu oferta',
    },
    {
        conversationId: 3,
        offerId: 5,
        participant1Id: 5,
        participant2Id: 123,
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastMessagePreview: 'Hola, me interesa tu oferta de vidrio',
        preview: 'Hola, me interesa tu oferta de vidrio',
    },
];

const MOCK_MESSAGES: Record<number, Message[]> = {
    1: [
        {
            id: 1,
            senderId: 2,
            text: 'Hola, me interesa tu oferta de cartón',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 2,
            senderId: 123,
            text: 'Hola! Claro, tengo 1000kg disponibles',
            createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        },
        {
            id: 3,
            senderId: 2,
            text: '¿Cuándo puedes recoger el material?',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
    ],
    2: [
        {
            id: 4,
            senderId: 3,
            text: 'Me interesa el aluminio, ¿aceptas $2200?',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 5,
            senderId: 123,
            text: 'Perfecto, acepto tu oferta',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
    ],
    3: [
        {
            id: 6,
            senderId: 123,
            text: 'Hola, me interesa tu oferta de vidrio',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
    ],
};

export const chatService = {
    /**
     * Obtener todas las conversaciones del usuario
     * GET /api/chat/conversations?userId={id}
     */
    getConversations: async (userId: number): Promise<ConversationSummary[]> => {
        try {
            // TODO: Descomentar cuando el backend esté listo
            // const response = await apiClient.get<ConversationSummary[]>('/api/chat/conversations', {
            //     params: { userId },
            // });
            // return response.data;

            // Mock: filtrar conversaciones del usuario
            await new Promise((resolve) => setTimeout(resolve, 400));
            console.log('📥 getConversations para userId:', userId);
            return MOCK_CONVERSATIONS.filter(
                (conv) => conv.participant1Id === userId || conv.participant2Id === userId
            );
        } catch (error) {
            console.error('Error al obtener conversaciones:', error);
            throw error;
        }
    },

    /**
     * Crear nueva conversación desde oferta
     * POST /api/chat/conversations
     */
    createConversation: async (data: CreateConversationRequest): Promise<{ conversationId: number }> => {
        try {
            // TODO: Descomentar cuando el backend esté listo
            // const response = await apiClient.post<{ conversationId: number }>('/api/chat/conversations', data);
            // return response.data;

            // Mock: crear conversación simulada
            await new Promise((resolve) => setTimeout(resolve, 500));
            console.log('✨ Creando conversación:', data);

            const newConvId = MOCK_CONVERSATIONS.length + 1;
            const newConv: ConversationSummary = {
                conversationId: newConvId,
                offerId: data.offerId,
                participant1Id: data.senderId,
                participant2Id: data.receiverId,
                updatedAt: new Date().toISOString(),
                lastMessagePreview: data.firstMessage || 'Nueva conversación',
                preview: data.firstMessage || 'Nueva conversación',
            };

            MOCK_CONVERSATIONS.unshift(newConv);

            if (data.firstMessage) {
                MOCK_MESSAGES[newConvId] = [
                    {
                        id: Date.now(),
                        senderId: data.senderId,
                        text: data.firstMessage,
                        createdAt: new Date().toISOString(),
                    },
                ];
            }

            return { conversationId: newConvId };
        } catch (error) {
            console.error('Error al crear conversación:', error);
            throw error;
        }
    },

    /**
     * Obtener mensajes de una conversación
     * GET /api/chat/conversations/{conversationId}/messages
     */
    getMessages: async (conversationId: number): Promise<Message[]> => {
        try {
            // TODO: Descomentar cuando el backend esté listo
            // const response = await apiClient.get<Message[]>(`/api/chat/conversations/${conversationId}/messages`);
            // return response.data;

            // Mock: retornar mensajes simulados
            await new Promise((resolve) => setTimeout(resolve, 300));
            console.log('💬 getMessages para conversación:', conversationId);
            return MOCK_MESSAGES[conversationId] || [];
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw error;
        }
    },

    /**
     * Enviar mensaje en una conversación
     * POST /api/chat/conversations/{conversationId}/messages
     */
    sendMessage: async (conversationId: number, data: SendMessageRequest): Promise<Message> => {
        try {
            // TODO: Descomentar cuando el backend esté listo
            // const response = await apiClient.post<Message>(
            //     `/api/chat/conversations/${conversationId}/messages`,
            //     data
            // );
            // return response.data;

            // Mock: agregar mensaje a la conversación
            await new Promise((resolve) => setTimeout(resolve, 200));
            console.log('📤 Enviando mensaje:', data);

            const newMessage: Message = {
                id: Date.now(),
                senderId: data.senderId,
                text: data.text,
                createdAt: new Date().toISOString(),
            };

            if (!MOCK_MESSAGES[conversationId]) {
                MOCK_MESSAGES[conversationId] = [];
            }
            MOCK_MESSAGES[conversationId].push(newMessage);

            // Actualizar preview en conversación
            const convIndex = MOCK_CONVERSATIONS.findIndex((c) => c.conversationId === conversationId);
            if (convIndex !== -1) {
                MOCK_CONVERSATIONS[convIndex].lastMessagePreview = data.text;
                MOCK_CONVERSATIONS[convIndex].preview = data.text;
                MOCK_CONVERSATIONS[convIndex].updatedAt = new Date().toISOString();
            }

            return newMessage;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw error;
        }
    },
};
