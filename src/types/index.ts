// TypeScript type definitions

export { isEmailValid, MAX_PHOTO_SIZE_MB } from './forms';
export type { RegisterForm, RegisterFormErrors, Role } from './forms';

/**
 * Datos del usuario almacenados localmente
 * Basado en el schema User del backend
 */
export interface UserData {
    id: string;
    enterpriseName: string;
    username: string;
    nit?: string;
    email: string;
    rol: string;
}

/**
 * Labels legibles para los tipos de usuario
 */
export const USER_TYPE_LABELS: Record<string, string> = {
    compra: 'Comprador',
    comprador: 'Comprador',
    vende: 'Vendedor',
    vendedor: 'Vendedor',
    genera: 'Generador',
    generador: 'Generador',
} as const;

/**
 * Publicación de material reciclable
 * Basado en el schema Post del backend
 */
export interface Post {
    id: string;
    title: string;
    material: string;
    quantity: number;
    price: number;
    location: string;
    description: string;
    owner: string; // userId del propietario
    offers: string[]; // array de offer IDs
}

/**
 * Datos para crear una nueva publicación
 */
export interface CreatePostRequest {
    title: string;
    material: string;
    quantity: number;
    price: number;
    location: string;
    description: string;
}

/**
 * Datos para actualizar una publicación existente
 */
export interface UpdatePostRequest {
    id: string;
    title: string;
    material: string;
    quantity: number;
    price: number;
    location: string;
    description: string;
    owner: string;
    offers: string[];
}

/**
 * Estado de una oferta
 */
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/**
 * Usuario simplificado (offerer)
 * Información del usuario que hace la oferta
 */
export interface OffererUser {
    id: string;
    enterpriseName: string;
    username: string;
    nit: string;
    email: string;
    rol: string;
}

/**
 * Oferta completa
 * Basado en el schema Offer del backend
 */
export interface Offer {
    id: string;
    amount: number;
    message: string;
    date: string; // ISO string
    publication: Post;
    offerer: OffererUser;
    status: OfferStatus;
    conversation: string;
}

/**
 * Datos para crear una nueva oferta
 * POST /offers/new
 */
export interface CreateOfferRequest {
    amount: number;
    message: string;
    publicationId: string;
}

/**
 * Datos para actualizar una oferta existente
 * PUT /offers/update
 */
export interface UpdateOfferRequest {
    id: string;
    amount: number;
    message: string;
    status?: OfferStatus; // Opcional para aceptar/rechazar
}

/**
 * Mensaje de chat
 * Schema del backend
 */
export interface Message {
    id: number;
    text: string;
    senderId: number;
    createdAt: string; // ISO timestamp
}

/**
 * Conversación completa con mensajes
 * Schema del backend
 */
export interface Conversation {
    id: number;
    offerId: number;
    participants: number[]; // [participant1Id, participant2Id]
    messages: Message[];
}

/**
 * Resumen de conversación para lista
 * DTO del backend GET /api/chat/conversations
 */
export interface ConversationSummary {
    conversationId: number;
    offerId: number;
    participant1Id: number;
    participant2Id: number;
    updatedAt: string; // ISO timestamp
    lastMessagePreview: string;
    preview: string; // Alias de lastMessagePreview
}

/**
 * Request para crear nueva conversación
 * POST /api/chat/conversations
 */
export interface CreateConversationRequest {
    offerId: number;
    senderId: number;
    receiverId: number;
    firstMessage?: string;
}

/**
 * Request para enviar mensaje
 * POST /api/chat/conversations/{id}/messages
 */
export interface SendMessageRequest {
    senderId: number;
    text: string;
}
