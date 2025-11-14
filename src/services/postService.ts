import type { CreatePostRequest, Post, UpdatePostRequest } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';

// import apiClient from './axiosConfig'; // TODO: Descomentar cuando el backend esté listo

// Mock data para desarrollo (se elimina cuando el backend esté listo)
const MOCK_POSTS: Post[] = [
    {
        id: '1',
        title: 'Plástico PET reciclable',
        material: 'PET',
        quantity: 500,
        price: 1200,
        location: 'Bogotá, Cundinamarca',
        description: 'Botellas de plástico PET limpias y prensadas, listas para reciclaje.',
        owner: 'mock-user-1',
        offers: [],
    },
    {
        id: '2',
        title: 'Cartón corrugado',
        material: 'Cartón',
        quantity: 1000,
        price: 800,
        location: 'Medellín, Antioquia',
        description: 'Cajas de cartón corrugado en excelente estado, clasificadas por tamaño.',
        owner: 'mock-user-2',
        offers: ['offer-1'],
    },
    {
        id: '3',
        title: 'Aluminio de latas',
        material: 'Aluminio',
        quantity: 300,
        price: 2500,
        location: 'Cali, Valle del Cauca',
        description: 'Latas de aluminio compactadas, sin residuos de bebidas.',
        owner: 'mock-user-1',
        offers: [],
    },
];

export const postService = {
    /**
     * Obtener todas las publicaciones
     * TODO: Backend ready - descomentar cuando esté disponible
     */
    getAllPosts: async (): Promise<Post[]> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Post[]>('/posts');
        // return response.data;

        // Mock: retornar datos locales
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simular latencia
        return MOCK_POSTS;
    },

    /**
     * Obtener una publicación por ID
     * TODO: Backend ready - GET /posts?id={uuid}
     */
    getPostById: async (postId: string): Promise<Post> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.get<Post>(`/posts?id=${postId}`);
        // return response.data;

        // Mock: buscar en datos locales
        await new Promise((resolve) => setTimeout(resolve, 300));
        const post = MOCK_POSTS.find((p) => p.id === postId);
        if (!post) {
            throw new Error('Publicación no encontrada');
        }
        return post;
    },

    /**
     * Crear nueva publicación
     * TODO: Backend ready - POST /posts/new
     * Requiere: Authorization header (automático con interceptor)
     *
     * Backend devuelve el User completo con el array de publications actualizado
     * Extraemos el post recién creado del array de publications
     */
    createPost: async (data: CreatePostRequest): Promise<Post> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.post('/posts/new', data);
        // // Backend devuelve User con publications[], extraer el último post creado
        // const userData = response.data;
        // const createdPost = userData.publications[userData.publications.length - 1];
        // return createdPost;

        // Mock: simular respuesta del backend
        await new Promise((resolve) => setTimeout(resolve, 500));
        const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user';

        // Simular que el backend genera el ID y devuelve el post completo
        const newPost: Post = {
            id: `mock-${Date.now()}`,
            title: data.title,
            material: data.material,
            quantity: data.quantity,
            price: data.price,
            location: data.location,
            description: data.description,
            owner: userId,
            offers: [], // Nuevo post sin ofertas
        };

        MOCK_POSTS.unshift(newPost); // Agregar al inicio
        return newPost;
    },

    /**
     * Actualizar publicación existente
     * TODO: Backend ready - PUT /posts/update
     */
    updatePost: async (data: UpdatePostRequest): Promise<Post> => {
        // TODO: Descomentar cuando el backend esté listo
        // const response = await apiClient.put<Post>('/posts/update', data);
        // return response.data;

        // Mock: actualizar en datos locales
        await new Promise((resolve) => setTimeout(resolve, 500));
        const index = MOCK_POSTS.findIndex((p) => p.id === data.id);
        if (index === -1) {
            throw new Error('Publicación no encontrada');
        }
        MOCK_POSTS[index] = { ...data };
        return MOCK_POSTS[index];
    },

    /**
     * Eliminar publicación
     * TODO: Backend ready - DELETE /posts/delete
     */
    deletePost: async (postId: string): Promise<void> => {
        // TODO: Descomentar cuando el backend esté listo
        // await apiClient.delete('/posts/delete', { data: postId });

        // Mock: eliminar de datos locales
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = MOCK_POSTS.findIndex((p) => p.id === postId);
        if (index === -1) {
            throw new Error('Publicación no encontrada');
        }
        MOCK_POSTS.splice(index, 1);
    },

    /**
     * Obtener publicaciones del usuario actual
     * TODO: Backend podría tener endpoint /posts/my-posts o filtrar por owner
     */
    getMyPosts: async (): Promise<Post[]> => {
        // TODO: Si el backend implementa endpoint específico, usar:
        // const response = await apiClient.get<Post[]>('/posts/my-posts');
        // return response.data;

        // Mock: filtrar posts del usuario actual
        await new Promise((resolve) => setTimeout(resolve, 400));
        const userId = (await storage.getItem(STORAGE_KEYS.user_id)) || 'mock-user';
        return MOCK_POSTS.filter((p) => p.owner === userId);
    },
};
