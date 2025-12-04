import type { RegisterForm } from '@/src/types/forms';
import apiClient from './axiosConfig';

interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        userType: string;
    };
}

interface RegisterResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        userType: string;
    };
}

interface GoogleRegisterResponse {
    id: string;
    enterpriseName: string;
    username: string;
    nit: string;
    email: string;
    rol: string;
    password: string | null;
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/api/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    register: async (data: RegisterForm): Promise<RegisterResponse> => {
        const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
        return response.data;
    },

    registerWithGoogle: async (data: RegisterForm, accessToken: string): Promise<GoogleRegisterResponse> => {
        console.log('🔐 Registrando con Google OAuth...');
        console.log('📧 Email:', data.email);
        console.log('🏢 Enterprise:', data.enterpriseName);
        console.log('👤 Username:', data.username);
        console.log('🎭 Role:', data.role);
        console.log('🔑 Token (primeros 30 chars):', `${accessToken.substring(0, 30)}...`);
        console.log('🔑 Longitud del token:', accessToken.length);

        const response = await apiClient.post<GoogleRegisterResponse>(
            '/api/auth/register/google',
            {
                enterpriseName: data.enterpriseName,
                username: data.username,
                nit: data.nit || '',
                email: data.email,
                role: data.role,
            },
            {
                headers: {
                    // biome-ignore lint/style/useNamingConvention: Backend expects "Bearer <token>" format
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log('✅ Registro exitoso:', response.data);
        return response.data;
    },

    // TODO: Backend no implementado - Endpoint no disponible actualmente
    // Cuando el backend implemente GET /users/profile, descomentar
    // getProfile: async () => {
    // 	const response = await apiClient.get('/users/profile');
    // 	return response.data;
    // },

    // TODO: Backend no implementado - Endpoint no disponible actualmente
    // Cuando el backend implemente POST /auth/logout, descomentar
    // Por ahora el logout se hace solo limpiando el token en AuthContext
    // logout: async () => {
    // 	await apiClient.post('/auth/logout');
    // },
};
