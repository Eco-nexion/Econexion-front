import apiClient from '@/src/services/axiosConfig';
import { Post } from '@type/post';

interface CreatePostDTO {
    title: string;
    material: string;
    quantity: number;
    price: number;
    location: string;
    description?: string;
}

export const PostsService = {
    async createPost(data: CreatePostDTO): Promise<Post> {
        const response = await apiClient.post<Post>('/posts/new', data);
        return response.data;
    },

    async getPostById(id: string): Promise<Post> {
        const response = await apiClient.get<Post>('/posts', { data: { id } });  // Usa body como en backend
        return response.data;
    },

    async updatePost(post: Post): Promise<Post> {
        const response = await apiClient.put<Post>('/posts/update', post);
        return response.data;
    },

    async deletePost(id: string): Promise<void> {
        await apiClient.delete('/posts/delete', { data: { id } });  // Usa body
    },

    async getPosts(): Promise<Post[]> {  // Lista todos (implementa en backend si no existe)
        const response = await apiClient.get<Post[]>('/posts/all');
        return response.data;
    },

    async getMyPosts(): Promise<Post[]> {  // Lista propios (implementa en backend con token)
        const response = await apiClient.get<Post[]>('/posts/my');
        return response.data;
    },
};