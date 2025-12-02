import { Offer } from "@type/offer";

export interface Post {
    id: string;
    title: string;
    material: string;
    quantity: number;
    price: number;
    location: string;
    description?: string;
    owner?: { id: string };
    offers?: Offer[];
    imageUrl?: string;  // Nuevo: Agregado para match diseño (opcional, fallback en components)
}