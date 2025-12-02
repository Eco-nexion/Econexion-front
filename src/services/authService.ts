import apiClient from '@/src/services/axiosConfig';
import { storage } from '@utils/storage';
import { STORAGE_KEYS } from '@constants/storage';
import { parseJwt } from '@utils/jwtUtils'; // Nuevo import

// Types basados en backend DTOs
interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    enterpriseName: string;
    nit: string;
    rol: 'GENERATOR' | 'RECYCLER';
}

interface LoginRequest {
    email: string;
    password: string;
}

interface UserDTO {
    id: string;
    name: string;
    email: string;
    role: 'GENERATOR' | 'RECYCLER';
}

interface LoginResponse {
    token: string;
}

// Servicio de autenticación
export const AuthService = {
    /**
     * Registra un nuevo usuario (devuelve solo user, no token)
     */
    async register(data: {
        companyName: string;
        nit?: string;
        userName: string;
        position: string;
        photoUri?: string;
        email: string;
        password: string;
        role: 'GENERATOR' | 'RECYCLER';
    }): Promise<UserDTO> {
        // Mapear exactamente al DTO backend RegisterRequest
        const request: RegisterRequest = {
            username: data.userName,
            password: data.password,
            email: data.email,
            enterpriseName: data.companyName,
            nit: data.nit || '',
            rol: data.role,
        };

        const response = await apiClient.post<UserDTO>('api/auth/register', request);

        // NO almacenar nada (no hay token/login automático)
        // Almacenar extras si aplican (opcional, pero como antes)
        if (data.nit) await storage.setItem('user_nit', data.nit);
        if (data.position) await storage.setItem('user_position', data.position);

        // Mapear backend User a UserDTO (username -> name)
        return {
            id: response.data.id,
            name: response.data.username,
            email: response.data.email,
            role: response.data.rol as 'GENERATOR' | 'RECYCLER',
        };
    },

    /**
     * Inicia sesión (devuelve token, parsea user de JWT)
     */
    async login(email: string, password: string): Promise<{ token: string; user: UserDTO }> {
        const request: LoginRequest = { email, password };
        const response = await apiClient.post<LoginResponse>('api/auth/login', request);

        const token = response.data.token;
        const parsedUser = parseJwt(token);
        if (!parsedUser) {
            throw new Error('Invalid JWT payload');
        }

        // Almacenar en storage
        await storage.setItem(STORAGE_KEYS.token, token);
        console.log('Token stored:', token.substring(0, 20) + '...');
        await storage.setItem(STORAGE_KEYS.user_name, parsedUser.name);
        await storage.setItem(STORAGE_KEYS.user_email, parsedUser.email);
        await storage.setItem(STORAGE_KEYS.user_id, parsedUser.id);
        await storage.setItem(STORAGE_KEYS.user_type, parsedUser.role);

        return { token, user: parsedUser };
    },

    /**
     * Cierra sesión
     */
    async logout(): Promise<void> {
        await storage.removeItem(STORAGE_KEYS.token);
        await storage.removeItem(STORAGE_KEYS.user_name);
        await storage.removeItem(STORAGE_KEYS.user_email);
        await storage.removeItem(STORAGE_KEYS.user_id);
        await storage.removeItem(STORAGE_KEYS.user_type);
        // Limpia extras si aplican
    },

    /**
     * Obtiene el usuario actual desde storage (o valida con backend si implementas /users/me)
     */
    async getCurrentUser(): Promise<UserDTO | null> {
        const token = await storage.getItem(STORAGE_KEYS.token);
        if (!token) return null;

        // Si backend tiene /api/users/me, descomenta:
        // const response = await apiClient.get<UserDTO>('/users/me');
        // return response.data;

        // Por ahora, reconstruye de storage
        return {
            id: (await storage.getItem(STORAGE_KEYS.user_id)) || '',
            name: (await storage.getItem(STORAGE_KEYS.user_name)) || '',
            email: (await storage.getItem(STORAGE_KEYS.user_email)) || '',
            role: (await storage.getItem(STORAGE_KEYS.user_type)) as 'GENERATOR' | 'RECYCLER' || 'GENERATOR',
        };
    },
};