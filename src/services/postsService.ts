import apiClient from './axiosConfig';

export interface Post {
    id: string;
    title: string;
    description: string;
    wasteType: string;
    quantity: number;
    unit: string;
    price?: number;
    location: string;
    imageUrl?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostRequest {
    title: string;
    description: string;
    wasteType: string;
    quantity: number;
    unit: string;
    price?: number;
    location: string;
    imageUrl?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

class PostsService {
    // Obtener todos los posts
    async getPosts(): Promise<Post[]> {
        try {
            const response = await apiClient.get<Post[]>('/posts');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al obtener posts');
        }
    }

    // Obtener un post por ID
    async getPostById(id: string): Promise<Post> {
        try {
            const response = await apiClient.get<Post>(`/posts/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al obtener el post');
        }
    }

    // Crear un nuevo post
    async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const response = await apiClient.post<Post>('/posts/new', postData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al crear post');
        }
    }

    // Actualizar un post
    async updatePost(id: string, postData: UpdatePostRequest): Promise<Post> {
        try {
            const response = await apiClient.put<Post>(`/posts/update/${id}`, postData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al actualizar post');
        }
    }

    // Eliminar un post
    async deletePost(id: string): Promise<void> {
        try {
            await apiClient.delete(`/posts/delete/${id}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al eliminar post');
        }
    }

    // Obtener posts del usuario actual
    async getMyPosts(): Promise<Post[]> {
        try {
            const response = await apiClient.get<Post[]>('/posts/my-posts');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al obtener tus posts');
        }
    }
}

export default new PostsService();
