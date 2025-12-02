import apiClient from '@/src/services/axiosConfig';
import { Offer } from '@type/offer';

interface CreateOfferDTO {
    publicationId: string;
    amount: number;
    message?: string;
}

export const OffersService = {
    async createOffer(data: CreateOfferDTO): Promise<Offer> {
        const response = await apiClient.post<Offer>('/offers/new', data);
        return response.data;
    },

    async getOfferById(id: string): Promise<Offer> {
        const response = await apiClient.get<Offer>(`/offers/${id}`);
        return response.data;
    },

    async updateOffer(offer: Offer): Promise<Offer> {
        const response = await apiClient.put<Offer>('/offers/update', offer);
        return response.data;
    },

    async deleteOffer(id: string): Promise<void> {
        await apiClient.delete(`/offers/${id}`);
    },

    async getReceivedOffers(): Promise<Offer[]> {  // Para generador: Offers en mis posts
        const response = await apiClient.get<Offer[]>('/offers/received');  // Asume endpoint nuevo en backend
        return response.data;
    },

    async getSentOffers(): Promise<Offer[]> {  // Para reciclador: Mis offers
        const response = await apiClient.get<Offer[]>('/offers/sent');  // Asume endpoint nuevo
        return response.data;
    },

    async getOffersByPostId(postId: string): Promise<Offer[]> {
        const response = await apiClient.get<Offer[]>(`/posts/${postId}/offers`);  // Asume endpoint; sino, getPostById y extrae offers
        return response.data;
    },
};