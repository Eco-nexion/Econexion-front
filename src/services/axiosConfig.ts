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
            console.log('🔑 [Interceptor] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('✅ [Interceptor] Authorization header agregado');
            } else {
                console.warn('⚠️ [Interceptor] No hay token en storage');
            }
            
            console.log('📡 [Interceptor] Request completo:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                fullURL: `${config.baseURL}${config.url}`,
                hasAuth: !!config.headers.Authorization,
                contentType: config.headers['Content-Type'],
                headers: {
                    Authorization: config.headers.Authorization ? `Bearer ${String(config.headers.Authorization).substring(7, 30)}...` : 'NO AUTH',
                    'Content-Type': config.headers['Content-Type']
                }
            });
            
            // Log del body si es POST/PUT
            if ((config.method === 'post' || config.method === 'put') && config.data) {
                console.log('📦 [Interceptor] Request Body:', typeof config.data === 'string' ? config.data : JSON.stringify(config.data, null, 2));
            }
        } catch (error) {
            console.error('❌ [Interceptor] Error getting token:', error);
        }
        return config;
    },
    (error) => {
        console.error('❌ [Interceptor] Request error:', error);
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
