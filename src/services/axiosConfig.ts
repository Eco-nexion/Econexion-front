import { API_CONFIG, STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import axios from 'axios';

// Crear instancia de axios con configuración centralizada
const apiClient = axios.create({
    // biome-ignore lint/style/useNamingConvention: axios config
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.token);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401) y no hemos reintentado
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Limpiar token y redirigir al login
            await storage.removeItem(STORAGE_KEYS.token);
            // Aquí podrías usar un evento o context para redirigir al login

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
