import type { CreateOfferRequest, Offer, OfferStatus, UpdateOfferRequest } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';

import apiClient from './axiosConfig';

// Mock data para desarrollo (se elimina cuando el backend esté listo)
const MOCK_OFFERS: Offer[] = [
    {
        id: 'offer-1',
        amount: 1500,
        message: 'Me interesa tu material PET. ¿Podrías reservarlo?',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
        publication: {
            id: '2',
            title: 'Cartón corrugado',
            material: 'Cartón',
            quantity: 1000,
            price: 800,
            location: 'Medellín, Antioquia',
            description: 'Cajas de cartón corrugado en excelente estado, clasificadas por tamaño.',
            owner: 'mock-user-id-123', // YO soy el dueño
            offers: ['offer-1'],
        },
        offerer: {
            id: 'mock-user-2',
            enterpriseName: 'ReciclaPlus SAS',
            username: 'reciclapluss',
            nit: '900123456',
            email: 'contacto@reciclaplus.com',
            rol: 'comprador',
        },
        status: 'PENDING',
        conversation: 'conv-1',
    },
    {
        id: 'offer-2',
        amount: 2200,
        message: 'Puedo recoger el aluminio esta semana. ¿Aceptas este precio?',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
        publication: {
            id: '3',
            title: 'Aluminio de latas',
            material: 'Aluminio',
            quantity: 300,
            price: 2500,
            location: 'Cali, Valle del Cauca',
            description: 'Latas de aluminio compactadas, sin residuos de bebidas.',
            owner: 'mock-user-id-123', // YO soy el dueño
            offers: ['offer-2'],
        },
        offerer: {
            id: 'mock-user-3',
            enterpriseName: 'Metales Verdes Colombia',
            username: 'metalesverdes',
            nit: '900789123',
            email: 'info@metalesverdes.co',
            rol: 'comprador',
        },
        status: 'ACCEPTED',
        conversation: 'conv-2',
    },
    {
        id: 'offer-3',
        amount: 1100,
        message: 'Necesito el material urgente para un proyecto grande',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
        publication: {
            id: '1',
            title: 'Plástico PET reciclable',
            material: 'PET',
            quantity: 500,
            price: 1200,
            location: 'Bogotá, Cundinamarca',
            description: 'Botellas de plástico PET limpias y prensadas, listas para reciclaje.',
            owner: 'mock-user-2', // OTRO usuario es el dueño
            offers: ['offer-3'],
        },
        offerer: {
            id: 'mock-user-id-123', // YO soy el oferente
            enterpriseName: 'Econexion S.A.S.',
            username: 'Juan Pérez',
            nit: '900123456-1',
            email: 'juan.perez@econexion.com',
            rol: 'comprador',
        },
        status: 'PENDING',
        conversation: 'conv-3',
    },
    {
        id: 'offer-4',
        amount: 750,
        message: 'Oferta rechazada por precio muy bajo',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
        publication: {
            id: '2',
            title: 'Cartón corrugado',
            material: 'Cartón',
            quantity: 1000,
            price: 800,
            location: 'Medellín, Antioquia',
            description: 'Cajas de cartón corrugado en excelente estado, clasificadas por tamaño.',
            owner: 'mock-user-id-123',
            offers: ['offer-1', 'offer-4'],
        },
        offerer: {
            id: 'mock-user-4',
            enterpriseName: 'Papel y Cartón SA',
            username: 'papelycarton',
            nit: '800234567',
            email: 'compras@papelycarton.com',
            rol: 'comprador',
        },
        status: 'REJECTED',
        conversation: 'conv-4',
    },
    {
        id: 'offer-5',
        amount: 3200,
        message: '¿Tienes más material disponible? Puedo comprar todo lo que tengas en stock',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Hace 6 horas
        publication: {
            id: '4',
            title: 'Vidrio clasificado',
            material: 'Vidrio',
            quantity: 800,
            price: 3000,
            location: 'Barranquilla, Atlántico',
            description: 'Vidrio clasificado por colores, limpio y libre de etiquetas.',
            owner: 'mock-user-id-123', // YO soy el dueño - OFERTA RECIBIDA
            offers: ['offer-5'],
        },
        offerer: {
            id: 'mock-user-5',
            enterpriseName: 'Vidrios del Caribe',
            username: 'vidrioscaribe',
            nit: '900345678',
            email: 'ventas@vidrioscaribe.com',
            rol: 'comprador',
        },
        status: 'PENDING',
        conversation: 'conv-5',
    },
];

export const offersService = {
    /**
     * Obtener todas las ofertas del usuario actual
     * TODO: Backend ready - determinar endpoint exacto
     * Posibles endpoints:
     * - GET /offers (todas las ofertas)
     * - GET /user/me/offers (ofertas del usuario)
     */
    getAllOffers: async (): Promise<Offer[]> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Offer[]>('/offers');
        // return response.data;

        // Mock: retornar datos locales
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_OFFERS;
    },

    /**
     * Obtener ofertas recibidas (para publicaciones del usuario actual)
     * Filtra ofertas donde el usuario es el owner de la publicación
     * TODO: Backend ready - GET /offers/received
     */
    getReceivedOffers: async (): Promise<Offer[]> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Offer[]>('/offers/received');
        // return response.data;

        // Mock: filtrar ofertas donde soy el dueño de la publicación
        await new Promise((resolve) => setTimeout(resolve, 400));
        const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-id-123';
        console.log('🔍 getReceivedOffers - userId:', userId);
        const received = MOCK_OFFERS.filter((offer) => offer.publication.owner === userId);
        console.log('📥 Ofertas recibidas:', received.length);
        return received;
    },

    /**
     * Obtener ofertas hechas (creadas por el usuario actual)
     * Filtra ofertas donde el usuario es el offerer
     * TODO: Backend ready - GET /offers/sent o /offers/my-offers
     */
    getMyOffers: async (): Promise<Offer[]> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Offer[]>('/offers/sent');
        // return response.data;

        // Mock: filtrar ofertas donde soy el oferente
        await new Promise((resolve) => setTimeout(resolve, 400));
        const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-id-123';
        return MOCK_OFFERS.filter((offer) => offer.offerer.id === userId);
    },

    /**
     * Obtener ofertas por publicación
     * GET /publications/{id}/offers
     */
    getOffersByPublication: async (publicationId: string): Promise<Offer[]> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Offer[]>(`/publications/${publicationId}/offers`);
        // return response.data;

        // Mock: filtrar ofertas por publicación
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_OFFERS.filter((offer) => offer.publication.id === publicationId);
    },

    /**
     * Obtener una oferta por ID
     * GET /offers/{id}
     */
    getOfferById: async (offerId: string): Promise<Offer> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Offer>(`/offers/${offerId}`);
        // return response.data;

        // Mock: buscar en datos locales
        await new Promise((resolve) => setTimeout(resolve, 300));
        const offer = MOCK_OFFERS.find((o) => o.id === offerId);
        if (!offer) {
            throw new Error('Oferta no encontrada');
        }
        return offer;
    },

    /**
     * Crear nueva oferta
     * POST /offers/new
     * Requiere: Authorization header (automático con interceptor)
     */
    createOffer: async (data: CreateOfferRequest): Promise<Offer> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.post<Offer>('/offers/new', data);
        // return response.data;

        // Mock: simular respuesta del backend
        await new Promise((resolve) => setTimeout(resolve, 500));
        const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user-1';

        // Simular búsqueda de la publicación (en producción vendría del backend)
        const publication = {
            id: data.publicationId,
            title: 'Publicación Mock',
            material: 'Material Mock',
            quantity: 100,
            price: 1000,
            location: 'Ubicación Mock',
            description: 'Descripción mock',
            owner: 'mock-owner',
            offers: [],
        };

        const newOffer: Offer = {
            id: `offer-mock-${Date.now()}`,
            amount: data.amount,
            message: data.message,
            date: new Date().toISOString(),
            publication,
            offerer: {
                id: userId,
                enterpriseName: 'Mi Empresa Mock',
                username: 'usuario-mock',
                nit: '123456789',
                email: 'mock@email.com',
                rol: 'comprador',
            },
            status: 'PENDING',
            conversation: `conv-${Date.now()}`,
        };

        MOCK_OFFERS.unshift(newOffer);
        return newOffer;
    },

    /**
     * Actualizar oferta existente
     * PUT /offers/update
     * Permite editar amount, message y status
     */
    updateOffer: async (data: UpdateOfferRequest): Promise<Offer> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.put<Offer>('/offers/update', data);
        // return response.data;

        // Mock: actualizar en datos locales
        await new Promise((resolve) => setTimeout(resolve, 500));
        const index = MOCK_OFFERS.findIndex((o) => o.id === data.id);
        if (index === -1) {
            throw new Error('Oferta no encontrada');
        }

        console.log('🔄 Actualizando oferta:', data.id, 'nuevo status:', data.status);

        const updatedOffer: Offer = {
            ...MOCK_OFFERS[index],
            amount: data.amount,
            message: data.message,
        };

        if (data.status) {
            updatedOffer.status = data.status;
        }

        MOCK_OFFERS[index] = updatedOffer;

        console.log('✅ Oferta actualizada:', MOCK_OFFERS[index]);
        return MOCK_OFFERS[index];
    },

    /**
     * Eliminar oferta
     * DELETE /offers/{id}
     */
    deleteOffer: async (offerId: string): Promise<void> => {
        try {
            await apiClient.delete(`/offers/${offerId}`);
        } catch (error) {
            console.error('Error al eliminar oferta:', error);
            throw error;
        }

        // Mock: también eliminar de datos locales para consistencia
        const index = MOCK_OFFERS.findIndex((o) => o.id === offerId);
        if (index !== -1) {
            MOCK_OFFERS.splice(index, 1);
        }
    },

    /**
     * Aceptar oferta (cambia status a ACCEPTED)
     * Usa PUT /offers/update internamente
     */
    acceptOffer: async (offerId: string): Promise<Offer> => {
        console.log('✅ acceptOffer llamado para:', offerId);
        const offer = await offersService.getOfferById(offerId);
        console.log('📝 Oferta encontrada:', offer.id, 'status actual:', offer.status);
        const result = await offersService.updateOffer({
            id: offerId,
            amount: offer.amount,
            message: offer.message,
            status: 'ACCEPTED',
        });
        console.log('✅ acceptOffer completado, nuevo status:', result.status);
        return result;
    },

    /**
     * Rechazar oferta (cambia status a REJECTED)
     * Usa PUT /offers/update internamente
     */
    rejectOffer: async (offerId: string): Promise<Offer> => {
        console.log('❌ rejectOffer llamado para:', offerId);
        const offer = await offersService.getOfferById(offerId);
        console.log('📝 Oferta encontrada:', offer.id, 'status actual:', offer.status);
        const result = await offersService.updateOffer({
            id: offerId,
            amount: offer.amount,
            message: offer.message,
            status: 'REJECTED',
        });
        console.log('❌ rejectOffer completado, nuevo status:', result.status);
        return result;
    },

    /**
     * Filtrar ofertas por estado
     * Función helper para filtrado local
     */
    filterOffersByStatus: (offers: Offer[], status?: OfferStatus): Offer[] => {
        if (!status) {
            return offers;
        }
        return offers.filter((offer) => offer.status === status);
    },
};
