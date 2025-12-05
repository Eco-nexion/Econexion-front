import type { CreatePostRequest, Post, UpdatePostRequest, UserWithPublications } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import apiClient from './axiosConfig';

export const postService = {
    /**
     * Obtener todas las publicaciones del usuario actual
     * GET /lab/users/get/{email}
     *
     * El backend no tiene endpoint directo para todas las publicaciones,
     * solo devuelve las publicaciones dentro del objeto User
     */
    getAllPosts: async (): Promise<Post[]> => {
        console.group('📋 postService.getAllPosts');
        try {
            const userEmail = await storage.getItem(STORAGE_KEYS.user_email);
            const userId = await storage.getItem(STORAGE_KEYS.user_id);

            if (!userEmail) {
                throw new Error('No se encontró el email del usuario en storage');
            }

            console.log('🔄 [GET ALL] Obteniendo publicaciones del usuario:', userEmail);
            console.log('🔄 [GET ALL] Endpoint:', `/lab/users/get/${encodeURIComponent(userEmail)}`);

            const response = await apiClient.get<UserWithPublications>(
                `/lab/users/get/${encodeURIComponent(userEmail)}`
            );

            console.log('✅ [GET ALL] Respuesta recibida:', {
                status: response.status,
                userId: response.data.id,
                email: response.data.email,
            });

            const userData = response.data;
            const publications = userData.publications || [];

            console.log('📄 [GET ALL] Publications del backend:', JSON.stringify(publications, null, 2));
            console.log(
                '📊 [GET ALL] Resumen de publicaciones:',
                publications.map((p) => ({
                    id: p.id,
                    title: p.title,
                    quantity: p.quantity,
                    price: p.price,
                }))
            );

            // Agregar el owner (userId) a cada publicación ya que el backend no lo incluye
            const publicationsWithOwner = publications.map((post: Post) => ({
                ...post,
                owner: userId || userData.id,
            }));

            console.log('✅ [GET ALL] Publicaciones procesadas:', {
                status: response.status,
                totalPosts: publicationsWithOwner.length,
                userId: userData.id,
                userEmail: userData.email,
            });

            console.groupEnd();
            return publicationsWithOwner;
        } catch (error: any) {
            console.error('❌ [GET ALL] Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudieron cargar las publicaciones. Verifica tu conexión.');
        }
    },

    /**
     * Obtener una publicación por ID
     * GET /posts?id={uuid}
     */
    getPostById: async (postId: string): Promise<Post> => {
        console.group('🔍 postService.getPostById');
        try {
            console.log('🔄 Iniciando petición GET /posts?id=', postId);

            const response = await apiClient.get<Post>('/posts', {
                params: { id: postId },
            });

            console.log('✅ Post encontrado:', {
                status: response.status,
                postId: response.data.id,
                title: response.data.title,
                owner: response.data.owner,
            });

            console.groupEnd();
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en getPostById:', {
                postId,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Publicación no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo cargar la publicación');
        }
    },

    /**
     * Crear nueva publicación
     * POST /posts/new
     * Requiere: Authorization header (automático con interceptor)
     *
     * Backend devuelve el User completo con el array de publications actualizado
     * Extraemos el post recién creado del array de publications
     */
    createPost: async (data: CreatePostRequest): Promise<Post> => {
        console.group('➕ postService.createPost');
        try {
            const userId = await storage.getItem(STORAGE_KEYS.user_id);
            const token = await storage.getItem(STORAGE_KEYS.token);

            console.log('🔄 Iniciando petición POST /posts/new');
            console.log('📦 Payload COMPLETO que se enviará:', JSON.stringify(data, null, 2));
            console.log('🔑 Token disponible:', token ? `${token.substring(0, 40)}...` : 'NO TOKEN');
            console.log('👤 User ID:', userId);

            // Log del payload tal cual se enviará
            console.log('📋 Request Details:', {
                endpoint: '/posts/new',
                method: 'POST',
                contentType: 'application/json',
                payloadKeys: Object.keys(data),
                payloadValues: {
                    title: data.title,
                    material: data.material,
                    quantity: data.quantity,
                    price: data.price,
                    location: data.location,
                    descriptionLength: data.description?.length || 0,
                    hasDescription: !!data.description,
                },
            });

            const response = await apiClient.post('/posts/new', data);

            console.log('✅ Respuesta recibida:', {
                status: response.status,
                responseType: typeof response.data,
                hasPublications: Array.isArray(response.data.publications),
            });

            // Backend devuelve User con publications[], extraer el último post creado
            const userData = response.data;

            if (!userData.publications || userData.publications.length === 0) {
                console.error('❌ Backend no devolvió publications array');
                throw new Error('Error al crear la publicación: respuesta inválida del servidor');
            }

            const createdPost = userData.publications[userData.publications.length - 1];

            console.log('✅ Post creado exitosamente:', {
                postId: createdPost.id,
                title: createdPost.title,
                owner: createdPost.owner,
            });

            console.groupEnd();
            return createdPost;
        } catch (error: any) {
            console.error('❌ Error en createPost:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                payload: data,
            });

            // Log detallado del error del backend
            if (error.response?.data) {
                console.error('🔍 [Backend Error Details]:', JSON.stringify(error.response.data, null, 2));
            }

            // Log del request completo en caso de error
            if (error.config) {
                console.error('📤 [Request que falló]:', {
                    url: error.config.url,
                    method: error.config.method,
                    baseURL: error.config.baseURL,
                    headers: error.config.headers,
                    data: error.config.data,
                });
            }

            console.groupEnd();

            if (error.response?.status === 500) {
                const backendMessage =
                    error.response?.data?.message || error.response?.data?.error || error.response?.data?.trace;
                throw new Error(
                    `Error del servidor (500): ${backendMessage || 'Error interno del servidor. Contacta al administrador.'}`
                );
            }
            if (error.response?.status === 400) {
                const backendMessage = error.response?.data?.message || error.response?.data?.error;
                const errorMsg = backendMessage
                    ? `Datos inválidos: ${backendMessage}`
                    : 'Datos inválidos. Verifica que todos los campos estén correctos.';
                throw new Error(errorMsg);
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo crear la publicación. Intenta nuevamente.');
        }
    },

    /**
     * Actualizar publicación existente
     * PUT /posts/update
     *
     * El backend requiere enviar el objeto User completo con el array de publications actualizado
     */
    updatePost: async (data: UpdatePostRequest): Promise<Post> => {
        console.group('✏️ postService.updatePost');
        console.log('🎯 [UPDATE] Datos recibidos:', JSON.stringify(data, null, 2));

        try {
            const userEmail = await storage.getItem(STORAGE_KEYS.user_email);
            console.log('📧 [UPDATE] Email del storage:', userEmail);

            if (!userEmail) {
                throw new Error('No se encontró el email del usuario en storage');
            }

            console.log('🔄 [UPDATE] Obteniendo datos del usuario...');

            // Primero obtenemos el User completo
            const userResponse = await apiClient.get<UserWithPublications>(
                `/lab/users/get/${encodeURIComponent(userEmail)}`
            );

            console.log('✅ [UPDATE] User obtenido:', {
                status: userResponse.status,
                userId: userResponse.data.id,
                email: userResponse.data.email,
                totalPublications: userResponse.data.publications.length,
                publicationIds: userResponse.data.publications.map((p) => p.id),
            });

            const userData = userResponse.data;

            // Encontramos y actualizamos la publicación en el array
            const postIndex = userData.publications.findIndex((p) => p.id === data.id);
            console.log('🔍 [UPDATE] Buscando post ID:', data.id, 'Índice encontrado:', postIndex);

            if (postIndex === -1) {
                console.error('❌ [UPDATE] Post no encontrado en publications[]');
                throw new Error('Publicación no encontrada en el usuario');
            }

            console.log('📝 [UPDATE] Post original:', JSON.stringify(userData.publications[postIndex], null, 2));

            // Actualizamos la publicación específica
            userData.publications[postIndex] = {
                id: data.id,
                title: data.title,
                material: data.material,
                quantity: data.quantity,
                price: data.price,
                location: data.location,
                description: data.description,
                offers: userData.publications[postIndex].offers, // Mantener offers existentes
            };

            console.log('📝 [UPDATE] Post actualizado:', JSON.stringify(userData.publications[postIndex], null, 2));
            console.log(
                '📦 [UPDATE] Payload completo que se enviará:',
                JSON.stringify(
                    {
                        userId: userData.id,
                        email: userData.email,
                        totalPublications: userData.publications.length,
                        updatedPostIndex: postIndex,
                    },
                    null,
                    2
                )
            );

            // Enviamos el User completo al backend
            console.log('🚀 [UPDATE] Enviando PUT /posts/update...');
            const response = await apiClient.put('/posts/update', userData);

            console.log('✅ [UPDATE] Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                hasData: !!response.data,
                dataType: typeof response.data,
                data: response.data,
            });

            // El backend devuelve un string "Post actualizado" en lugar del objeto User
            // Por lo tanto, devolvemos el post actualizado que ya tenemos en memoria
            const updatedPost = userData.publications[postIndex];

            console.log('✅ [UPDATE] Post actualizado (desde memoria local):', JSON.stringify(updatedPost, null, 2));

            console.groupEnd();
            return updatedPost;
        } catch (error: any) {
            console.error('❌ [UPDATE] Error capturado:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                hasResponse: !!error.response,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                },
            });

            console.log('🔍 [UPDATE] Tipo de error:', typeof error);
            console.log('🔍 [UPDATE] Es instancia de Error:', error instanceof Error);

            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Publicación no encontrada');
            }
            if (error.response?.status === 400) {
                throw new Error('Datos inválidos. Verifica que todos los campos estén correctos.');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            // Re-lanzar el error original si no es un error HTTP conocido
            throw error;
        }
    },

    /**
     * Eliminar publicación
     * DELETE /posts/delete
     * Envía el UUID como body (string)
     */
    deletePost: async (postId: string): Promise<void> => {
        console.group('🗑️ postService.deletePost');
        try {
            console.log('🔄 [DELETE] Iniciando petición DELETE /posts/delete');
            console.log('📦 [DELETE] PostId:', postId);
            console.log('📦 [DELETE] Payload (string UUID):', JSON.stringify(postId));

            // Backend espera el UUID como string en el body
            const response = await apiClient.delete('/posts/delete', {
                data: postId,
            });

            console.log('✅ [DELETE] Post eliminado exitosamente:', {
                status: response.status,
                statusText: response.statusText,
                postId,
                responseData: response.data,
            });

            console.groupEnd();
        } catch (error: any) {
            console.error('❌ [DELETE] Error en deletePost:', {
                postId,
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Publicación no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo eliminar la publicación');
        }
    },

    /**
     * Obtener publicaciones del usuario actual
     * Filtra los posts por owner (userId actual)
     */
    getMyPosts: async (): Promise<Post[]> => {
        console.group('👤 postService.getMyPosts');
        try {
            const userId = await storage.getItem(STORAGE_KEYS.user_id);
            console.log('🔄 Obteniendo posts del usuario:', userId);

            // Obtener todos los posts y filtrar por owner
            const allPosts = await postService.getAllPosts();
            const myPosts = allPosts.filter((p) => p.owner === userId);

            console.log('✅ Posts del usuario:', {
                userId,
                totalPosts: allPosts.length,
                myPosts: myPosts.length,
            });

            console.groupEnd();
            return myPosts;
        } catch (error: any) {
            console.error('❌ Error en getMyPosts:', {
                message: error.message,
                status: error.response?.status,
            });
            console.groupEnd();
            throw error;
        }
    },
};
