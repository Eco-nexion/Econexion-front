import { Post } from "@type/post";  // Nuevo: Import Post para publication

export interface Offer {
    id: string;
    amount: number;
    message?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    publication?: Post;  // Cambiado: publication es Post completo (con imageUrl)
    user?: { id: string };
}