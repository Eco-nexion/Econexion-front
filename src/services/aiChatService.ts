import type { ConversationSummary, Message } from "@/src/types";

// URL del backend de chat IA
const AI_CHAT_BASE_URL =
  "http://ec2-98-92-156-170.compute-1.amazonaws.com:8000";

// Tipos específicos para el chat IA
export interface AIChatRequest {
  message: string;
  userData: UserDataForAI;
}

export interface AIChatResponse {
  response: string;
}

export interface AISuggestionsResponse {
  suggestions: string[];
}

// Datos del usuario para enviar al chat IA
export interface OfferForAI {
  id: string;
  amount: number;
  message: string | null;
  date: string;
  status: string;
  conversation: string | null;
}

export interface PublicationForAI {
  id: string;
  title: string;
  material: string;
  quantity: number;
  price: number;
  location: string;
  description: string | null;
  offers: OfferForAI[];
}

export interface UserDataForAI {
  id: string;
  enterpriseName: string;
  username: string;
  nit: string | null;
  email: string;
  rol: string;
  publications: PublicationForAI[];
  offers: OfferForAI[];
  conversations: any[];
  allPublications: PublicationForAI[];
}

/**
 * Servicio para comunicarse con el backend de chat IA (FastAPI + Gemini)
 */
export const aiChatService = {
  /**
   * Envía un mensaje al chat IA con el contexto del usuario
   */
  sendMessage: async (
    message: string,
    userData: UserDataForAI
  ): Promise<string> => {
    try {
      const response = await fetch(`${AI_CHAT_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userData,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error del servidor: ${error}`);
      }

      const data: AIChatResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error en aiChatService.sendMessage:", error);
      throw error;
    }
  },

  /**
   * Obtiene sugerencias de preguntas basadas en los datos del usuario
   */
  getSuggestions: async (userData: UserDataForAI): Promise<string[]> => {
    try {
      const response = await fetch(`${AI_CHAT_BASE_URL}/chat/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "",
          userData,
        }),
      });

      if (!response.ok) {
        return []; // Si falla, retornar sugerencias vacías
      }

      const data: AISuggestionsResponse = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error("Error en aiChatService.getSuggestions:", error);
      return [];
    }
  },

  /**
   * Verifica si el servidor de chat IA está disponible
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${AI_CHAT_BASE_URL}/`, {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
