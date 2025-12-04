import type { UserData } from '@/src/types';
import apiClient from './axiosConfig';

interface UpdateUserRequest {
    enterpriseName?: string;
    name?: string;
    nit?: string;
    email?: string;
    password?: string;
    rol?: string;
}

export const userService = {
    // TODO: Backend endpoint - GET /lab/users/getUser/{id}
    getUserById: async (userId: string): Promise<UserData> => {
        const response = await apiClient.get<UserData>(`/lab/users/getUser/${userId}`);
        return response.data;
    },

    // TODO: Backend endpoint - PUT /lab/users/update/{id}
    updateUser: async (userId: string, data: UpdateUserRequest): Promise<UserData> => {
        const response = await apiClient.put<UserData>(`/lab/users/update/${userId}`, data);
        return response.data;
    },

    // TODO: Backend endpoint - DELETE /lab/users/{id}
    // Elimina la cuenta del usuario.
    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(`/lab/users/${userId}`);
    },
};
