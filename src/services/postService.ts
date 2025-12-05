import type { CreatePostRequest, Post, UpdatePostRequest, UserWithPublications } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import apiClient from './axiosConfig';

export const postService = {
    /**
     * Obtener TODAS las publicaciones de TODOS los usuarios (FEED)
     * GET /lab/users/allUsers -> obtiene todos los usuarios
     * Luego recopila todas sus publicaciones
     *
     * Esto crea un feed completo de publicaciones del sistema
     */
    getAllPosts: async (): Promise<Post[]> => {
        console.group('📰 postService.getAllPosts (FEED)');
        try {
            console.log('🔄 [FEED] Obteniendo TODOS los usuarios del sistema...');

            // Obtener todos los usuarios del sistema
            const usersResponse = await apiClient.get<UserWithPublications[]>('/lab/users/allUsers');
            const allUsers = usersResponse.data;

            console.log('✅ [FEED] Usuarios obtenidos:', {
                status: usersResponse.status,
                totalUsers: allUsers.length,
                userEmails: allUsers.map((u) => u.email),
            });

            // Recopilar todas las publicaciones de todos los usuarios
            const allPublications: Post[] = [];

            for (const user of allUsers) {
                const userPublications = user.publications || [];

                if (userPublications.length > 0) {
                    console.log(
                        `📝 [FEED] Usuario "${user.enterpriseName}" (${user.email}) tiene ${userPublications.length} publicaciones`
                    );

                    // Agregar el owner (userId) y ownerEmail a cada publicación
                    const publicationsWithOwner = userPublications.map((post: Post) => ({
                        ...post,
                        owner: post.owner || user.id, // Usar owner existente o userId
                        ownerEmail: post.ownerEmail || user.email, // Agregar email del dueño
                    }));

                    allPublications.push(...publicationsWithOwner);
                }
            }

            // Ordenar por fecha más reciente primero (si tienen fecha)
            // Si no tienen fecha, usar el orden del backend
            allPublications.sort((a, b) => {
                // Si tienen fecha, ordenar por fecha descendente
                if (a.date && b.date) {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                return 0; // Mantener orden original si no hay fechas
            });

            console.log('✅ [FEED] Feed completo generado:', {
                totalPublications: allPublications.length,
                fromUsers: allUsers.filter((u) => u.publications && u.publications.length > 0).length,
                publicationTitles: allPublications.map((p) => `${p.title} (${p.ownerEmail})`),
            });

            console.groupEnd();
            return allPublications;
        } catch (error: any) {
            console.error('❌ [FEED] Error:', {
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
     * Obtener las publicaciones del usuario actual solamente
     * GET /lab/users/get/{email}
     */
    getMyPosts: async (): Promise<Post[]> => {
        console.group('👤 postService.getMyPosts');
        try {
            const userEmail = await storage.getItem(STORAGE_KEYS.user_email);
            const userId = await storage.getItem(STORAGE_KEYS.user_id);

            if (!userEmail) {
                throw new Error('No se encontró el email del usuario en storage');
            }

            console.log('🔄 [MY POSTS] Obteniendo publicaciones del usuario:', userEmail);

            const response = await apiClient.get<UserWithPublications>(
                `/lab/users/get/${encodeURIComponent(userEmail)}`
            );

            const userData = response.data;
            const publications = userData.publications || [];

            // Agregar el owner (userId) y ownerEmail a cada publicación
            const publicationsWithOwner = publications.map((post: Post) => ({
                ...post,
                owner: userId || userData.id,
                ownerEmail: userEmail, // Email del usuario actual
            }));

            console.log('✅ [MY POSTS] Publicaciones del usuario:', {
                totalPosts: publicationsWithOwner.length,
                userId: userData.id,
            });

            console.groupEnd();
            return publicationsWithOwner;
        } catch (error: any) {
            console.error('❌ [MY POSTS] Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudieron cargar tus publicaciones.');
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
     * Actualizar publicación
     * 🚨 WORKAROUND: DELETE + POST (PUT no funciona en backend) 🚨
     * TODO: Reemplazar con PUT /posts/update cuando backend lo arregle
     *
     * Estrategia:
     * 1. Eliminar publicación existente (DELETE /posts/delete)
     * 2. Crear nueva publicación con datos actualizados (POST /posts/new)
     */
    updatePost: async (data: UpdatePostRequest): Promise<Post> => {
        console.group('✏️ postService.updatePost [DELETE+POST WORKAROUND]');
        console.log('🎯 [UPDATE] Datos recibidos:', JSON.stringify(data, null, 2));
        console.warn('⚠️ [WORKAROUND] Usando DELETE+POST porque PUT no funciona');

        try {
            // PASO 1: Eliminar publicación existente
            console.log('🔄 [UPDATE] PASO 1: Eliminando publicación existente...');
            await postService.deletePost(data.id);
            console.log('✅ [UPDATE] Publicación eliminada exitosamente');

            // PASO 2: Crear nueva publicación con datos actualizados
            console.log('🔄 [UPDATE] PASO 2: Creando nueva publicación con datos actualizados...');
            const createPayload: CreatePostRequest = {
                title: data.title,
                material: data.material,
                quantity: data.quantity,
                price: data.price,
                location: data.location,
                description: data.description,
            };

            console.log('📦 [UPDATE] Payload para crear:', JSON.stringify(createPayload, null, 2));
            const newPost = await postService.createPost(createPayload);

            console.log('✅ [UPDATE] Nueva publicación creada exitosamente:', {
                newPostId: newPost.id,
                title: newPost.title,
            });

            console.log('✅ [UPDATE] Actualización completada (DELETE+POST)');
            console.groupEnd();
            return newPost;
        } catch (error: any) {
            console.error('❌ [UPDATE] Error capturado:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                hasResponse: !!error.response,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });

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
};
