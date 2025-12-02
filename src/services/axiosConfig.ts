import axios from 'axios';
import { storage } from '@utils/storage';
import {STORAGE_KEYS} from "@constants";

// Base URL del backend (actualizado a puerto 35000)
const API_BASE_URL = 'http://localhost:35000';

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.token);
            console.log('Interceptor token:', token ? 'Present' : 'Missing');  // Debug
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Interceptor storage error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
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
            await storage.removeItem('auth_token');
            // Aquí podrías usar un evento o context para redirigir al login

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;