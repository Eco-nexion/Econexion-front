import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage wrapper que funciona en web, iOS y Android
 */
export const storage = {
    /**
     * Guarda un valor
     */
    setItem: async (key: string, value: string): Promise<void> => {
        console.log(`💾 storage.setItem - Platform: ${Platform.OS}, key: ${key}`);
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
                console.log(`✅ localStorage guardado: ${key}`);
            } else {
                await SecureStore.setItemAsync(key, value);
                console.log(`✅ SecureStore guardado: ${key}`);
            }
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene un valor
     */
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },

    /**
     * Elimina un valor
     */
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },

    /**
     * Limpia todo el storage
     */
    clear: (): void => {
        if (Platform.OS === 'web') {
            localStorage.clear();
        }
        // En SecureStore necesitas eliminar claves individualmente si es necesario
    },
};
