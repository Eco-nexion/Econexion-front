import { useState, useEffect, useCallback } from "react";
import { storage } from "@utils";
import { STORAGE_KEYS } from "@constants";
import type {
  UserDataForAI,
  PublicationForAI,
  OfferForAI,
} from "@/src/services/aiChatService";
import { postService, offersService } from "@/src/services";

/**
 * Hook para obtener los datos completos del usuario para el chat IA
 * Combina datos del storage con publicaciones y ofertas del servicio
 */
export function useUserDataForAI() {
  const [userData, setUserData] = useState<UserDataForAI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener datos básicos del storage
      const id = (await storage.getItem(STORAGE_KEYS.user_id)) || "";
      const enterpriseName =
        (await storage.getItem(STORAGE_KEYS.user_enterprise_name)) || "";
      const username =
        (await storage.getItem(STORAGE_KEYS.user_username)) || "";
      const nit = (await storage.getItem(STORAGE_KEYS.user_nit)) || null;
      const email = (await storage.getItem(STORAGE_KEYS.user_email)) || "";
      const rol = (await storage.getItem(STORAGE_KEYS.user_rol)) || "";

      // Obtener publicaciones
      let publications: PublicationForAI[] = [];
      let allPublications: PublicationForAI[] = [];

      try {
        const posts = await postService.getAllPosts();

        // Mapear TODAS las publicaciones para el contexto general
        allPublications = posts.map((post) => ({
          id: post.id,
          title: post.title,
          material: post.material,
          quantity: post.quantity,
          price: post.price,
          location: post.location,
          description: post.description,
          offers: [], // Las ofertas generales no se cargan aquí detalladamente por ahora
        }));

        // Filtrar y mapear MIS publicaciones
        const myPosts = posts.filter((p) => p.owner === id);
        publications = myPosts.map((post) => ({
          id: post.id,
          title: post.title,
          material: post.material,
          quantity: post.quantity,
          price: post.price,
          location: post.location,
          description: post.description,
          offers: [], // Se llenarán con receivedOffers
        }));
      } catch (e) {
        console.error("Error loading posts for AI:", e);
      }

      // Obtener ofertas recibidas (en mis publicaciones)
      try {
        const receivedOffers = await offersService.getReceivedOffers();
        // Agregar ofertas a cada publicación
        for (const offer of receivedOffers) {
          const pubIndex = publications.findIndex(
            (p) => p.id === offer.publication?.id
          );
          if (pubIndex !== -1) {
            publications[pubIndex].offers.push({
              id: offer.id,
              amount: offer.amount,
              message: offer.message,
              date: offer.date,
              status: offer.status,
              conversation: offer.conversation,
            });
          }
        }
      } catch (e) {
        console.error("Error loading received offers for AI:", e);
      }

      // Obtener ofertas enviadas (que yo hice)
      let sentOffers: OfferForAI[] = [];
      try {
        const myOffers = await offersService.getMyOffers();
        sentOffers = myOffers.map((offer) => ({
          id: offer.id,
          amount: offer.amount,
          message: offer.message,
          date: offer.date,
          status: offer.status,
          conversation: offer.conversation,
        }));
      } catch (e) {
        console.error("Error loading sent offers for AI:", e);
      }

      const fullUserData: UserDataForAI = {
        id,
        enterpriseName,
        username,
        nit,
        email,
        rol,
        publications,
        offers: sentOffers,
        conversations: [], // Inicializado vacío por solicitud
        allPublications,
      };

      setUserData(fullUserData);
    } catch (e) {
      console.error("Error loading user data for AI:", e);
      setError("Error al cargar datos del usuario");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return { userData, isLoading, error, refresh: loadUserData };
}
