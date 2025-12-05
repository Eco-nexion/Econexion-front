import type { CreateOfferRequest, Offer, OfferStatus, UpdateOfferRequest, UserWithPublications } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import apiClient from './axiosConfig';

// 🚨 CACHÉ LOCAL PARA ESTADOS MOCKEADOS (temporal hasta que backend funcione)
const MOCK_OFFERS_STATUS_CACHE_KEY = '@econexion:mock_offers_status';

/**
 * Obtener estados mockeados de ofertas desde caché
 */
const getMockedOfferStatuses = async (): Promise<Record<string, OfferStatus>> => {
    try {
        const cached = await storage.getItem(MOCK_OFFERS_STATUS_CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch {
        return {};
    }
};

/**
 * Guardar estado mockeado de una oferta en caché
 */
const saveMockedOfferStatus = async (offerId: string, status: OfferStatus): Promise<void> => {
    try {
        const cached = await getMockedOfferStatuses();
        cached[offerId] = status;
        await storage.setItem(MOCK_OFFERS_STATUS_CACHE_KEY, JSON.stringify(cached));
        console.log(`💾 [MOCK CACHE] Estado guardado: ${offerId} → ${status}`);
    } catch (error) {
        console.error('❌ [MOCK CACHE] Error al guardar:', error);
    }
};

/**
 * Aplicar estados mockeados de la caché a las ofertas
 */
const applyMockedStatuses = async (offers: Offer[]): Promise<Offer[]> => {
    const mockedStatuses = await getMockedOfferStatuses();
    return offers.map((offer) => {
        if (mockedStatuses[offer.id]) {
            console.log(`🎭 [MOCK CACHE] Aplicando estado mockeado a ${offer.id}: ${mockedStatuses[offer.id]}`);
            return { ...offer, status: mockedStatuses[offer.id] };
        }
        return offer;
    });
};

export const offersService = {
    /**
     * Obtener todas las ofertas (todas las del sistema)
     * GET /offers
     * Nota: Verificar si este endpoint existe en el backend
     */
    getAllOffers: async (): Promise<Offer[]> => {
        console.group('📋 offersService.getAllOffers');
        try {
            console.log('🔄 [GET ALL OFFERS] Obteniendo todas las ofertas del sistema');
            const response = await apiClient.get<Offer[]>('/offers');

            console.log('✅ [GET ALL OFFERS] Ofertas obtenidas:', {
                status: response.status,
                totalOffers: response.data.length,
            });

            console.groupEnd();
            return response.data;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [GET ALL OFFERS] Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudieron cargar las ofertas. Verifica tu conexión.');
        }
    },

    /**
     * Obtener ofertas recibidas (para publicaciones del usuario actual)
     * Estrategia: Obtener User completo y recopilar ofertas de todas sus publicaciones
     * GET /lab/users/get/{email} -> userData.publications[].offers[]
     */
    getReceivedOffers: async (): Promise<Offer[]> => {
        console.group('📥 offersService.getReceivedOffers');
        try {
            const userEmail = await storage.getItem(STORAGE_KEYS.user_email);

            if (!userEmail) {
                throw new Error('No se encontró el email del usuario en storage');
            }

            console.log('🔄 [RECEIVED] Obteniendo publicaciones del usuario:', userEmail);

            // Obtener User completo con sus publicaciones
            const response = await apiClient.get<UserWithPublications>(
                `/lab/users/get/${encodeURIComponent(userEmail)}`
            );

            const userData = response.data;
            console.log('✅ [RECEIVED] Usuario obtenido:', {
                userId: userData.id,
                totalPublications: userData.publications.length,
            });

            // Recopilar todas las ofertas de todas las publicaciones del usuario
            const receivedOffers: Offer[] = [];

            // Obtener todos los usuarios para buscar información de los offerers
            console.log('🔍 [RECEIVED] Obteniendo todos los usuarios para info de offerers...');
            const allUsersResponse = await apiClient.get<UserWithPublications[]>('/lab/users/allUsers');
            const allUsers = allUsersResponse.data;

            for (const publication of userData.publications) {
                if (publication.offers && publication.offers.length > 0) {
                    console.log(
                        `📦 [RECEIVED] Publicación "${publication.title}" tiene ${publication.offers.length} ofertas`
                    );

                    // Las ofertas vienen como objetos pero sin información completa
                    for (const offer of publication.offers) {
                        if (typeof offer === 'string') {
                            console.warn(`⚠️ [RECEIVED] Oferta es solo un ID: ${offer}`);
                            continue;
                        }

                        // Buscar el usuario que hizo la oferta
                        const offererUser = allUsers.find(
                            (user) =>
                                user.offers &&
                                user.offers.some((userOffer: any) => {
                                    const userOfferId = typeof userOffer === 'string' ? userOffer : userOffer.id;
                                    return userOfferId === offer.id;
                                })
                        );

                        if (offererUser) {
                            console.log(
                                `✅ [RECEIVED] Offerer encontrado para oferta ${offer.id}:`,
                                offererUser.enterpriseName
                            );

                            receivedOffers.push({
                                ...offer,
                                publication: {
                                    ...publication,
                                    ownerEmail: userData.email, // ¡AGREGAR EMAIL DEL DUEÑO!
                                },
                                publicationId: publication.id,
                                offerer: {
                                    id: offererUser.id,
                                    enterpriseName: offererUser.enterpriseName,
                                    username: offererUser.username,
                                    nit: offererUser.nit,
                                    email: offererUser.email,
                                    rol: offererUser.rol,
                                },
                            } as Offer);
                        } else {
                            console.warn(`⚠️ [RECEIVED] No se encontró offerer para oferta ${offer.id}`);
                            // Agregar la oferta con la publicación pero sin offerer
                            receivedOffers.push({
                                ...offer,
                                publication: {
                                    ...publication,
                                    ownerEmail: userData.email, // ¡AGREGAR EMAIL DEL DUEÑO!
                                },
                                publicationId: publication.id,
                            } as Offer);
                        }
                    }
                }
            }

            console.log('✅ [RECEIVED] Total ofertas recibidas:', receivedOffers.length);

            // 🚨 Aplicar estados mockeados desde caché
            const offersWithMockedStatuses = await applyMockedStatuses(receivedOffers);

            console.groupEnd();
            return offersWithMockedStatuses;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [RECEIVED] Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudieron cargar las ofertas recibidas.');
        }
    },

    /**
     * Obtener ofertas hechas (creadas por el usuario actual)
     * GET /lab/users/get/{email} -> userData.offers[]
     */
    getMyOffers: async (): Promise<Offer[]> => {
        console.group('📤 offersService.getMyOffers');
        try {
            const userEmail = await storage.getItem(STORAGE_KEYS.user_email);

            if (!userEmail) {
                throw new Error('No se encontró el email del usuario en storage');
            }

            console.log('🔄 [MY OFFERS] Obteniendo ofertas del usuario:', userEmail);

            const response = await apiClient.get<UserWithPublications>(
                `/lab/users/get/${encodeURIComponent(userEmail)}`
            );

            const userData = response.data;
            console.log('📦 [MY OFFERS] Respuesta del backend completa:', userData);

            const myOffers = userData.offers || [];
            console.log('📋 [MY OFFERS] Array de ofertas:', myOffers);
            console.log('📊 [MY OFFERS] Total ofertas:', myOffers.length);

            if (myOffers.length > 0) {
                console.log('🔍 [MY OFFERS] Primera oferta COMPLETA:', JSON.stringify(myOffers[0], null, 2));
                console.log('🔑 [MY OFFERS] Claves de primera oferta:', Object.keys(myOffers[0]));

                // Verificar cada campo importante
                const firstOffer = myOffers[0];
                console.log('🔍 [MY OFFERS] Análisis de primera oferta:', {
                    id: firstOffer.id,
                    amount: firstOffer.amount,
                    message: firstOffer.message,
                    date: firstOffer.date,
                    status: firstOffer.status,
                    hasPublication: 'publication' in firstOffer,
                    publicationValue: firstOffer.publication,
                    hasPublicationId: 'publicationId' in firstOffer,
                    publicationIdValue: (firstOffer as any).publicationId,
                    hasPost: 'post' in firstOffer,
                    postValue: (firstOffer as any).post,
                    allKeys: Object.keys(firstOffer),
                });
            } else {
                console.log('⚠️ [MY OFFERS] No hay ofertas para este usuario');
            }

            // Las ofertas vienen sin información de publicación
            // Necesitamos buscar en todas las publicaciones del sistema para encontrar a cuál pertenece cada oferta
            console.log('🔍 [MY OFFERS] Buscando publicaciones asociadas a las ofertas...');

            const fullOffers: Offer[] = [];

            // Importar postService para buscar publicaciones
            const { postService } = await import('./postService');
            const allPosts = await postService.getAllPosts();

            console.log('📚 [MY OFFERS] Total publicaciones en el sistema:', allPosts.length);

            // Crear objeto offerer con la información del usuario actual
            const currentUserOfferer = {
                id: userData.id,
                enterpriseName: userData.enterpriseName,
                username: userData.username,
                nit: userData.nit,
                email: userData.email,
                rol: userData.rol,
            };

            for (const offer of myOffers) {
                if (offer && typeof offer === 'object') {
                    // Buscar la publicación que contiene esta oferta
                    const relatedPost = allPosts.find(
                        (post) =>
                            post.offers &&
                            post.offers.some((o: any) => {
                                const offerId = typeof o === 'string' ? o : o.id;
                                return offerId === offer.id;
                            })
                    );

                    if (relatedPost) {
                        console.log('✅ [MY OFFERS] Publicación encontrada para oferta:', {
                            offerId: offer.id,
                            postTitle: relatedPost.title,
                            postId: relatedPost.id,
                        });

                        fullOffers.push({
                            ...offer,
                            publication: relatedPost,
                            publicationId: relatedPost.id,
                            offerer: currentUserOfferer, // Agregar información del usuario actual como offerer
                        } as Offer);
                    } else {
                        console.warn('⚠️ [MY OFFERS] No se encontró publicación para oferta:', offer.id);
                        fullOffers.push({
                            ...offer,
                            offerer: currentUserOfferer,
                        } as Offer);
                    }
                }
            }

            console.log('✅ [MY OFFERS] Ofertas procesadas:', fullOffers.length);
            console.log(
                '📊 [MY OFFERS] Ofertas finales:',
                fullOffers.map((o) => ({
                    id: o.id,
                    hasPublication: !!o.publication,
                    publicationKeys: o.publication ? Object.keys(o.publication) : 'N/A',
                }))
            );

            // 🚨 Aplicar estados mockeados desde caché
            const offersWithMockedStatuses = await applyMockedStatuses(fullOffers);

            console.groupEnd();
            return offersWithMockedStatuses;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [MY OFFERS] Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudieron cargar tus ofertas.');
        }
    },

    /**
     * Obtener ofertas por publicación
     * GET /publications/{id}/offers (si existe) o filtrar getAllOffers
     */
    getOffersByPublication: async (publicationId: string): Promise<Offer[]> => {
        console.group('🔍 offersService.getOffersByPublication');
        try {
            console.log('🔄 [BY PUB] Obteniendo ofertas de publicación:', publicationId);

            // Intentar endpoint específico primero
            try {
                const response = await apiClient.get<Offer[]>(`/publications/${publicationId}/offers`);
                console.log('✅ [BY PUB] Ofertas obtenidas:', response.data.length);
                console.groupEnd();
                return response.data;
                // biome-ignore lint/suspicious/noExplicitAny: Error handling
            } catch (error: any) {
                if (error.response?.status === 404) {
                    // Si no existe el endpoint, obtener todas y filtrar
                    console.log('⚠️ [BY PUB] Endpoint no existe, filtrando getAllOffers');
                    const allOffers = await offersService.getAllOffers();
                    const filtered = allOffers.filter((offer) => offer.publication.id === publicationId);
                    console.log('✅ [BY PUB] Ofertas filtradas:', filtered.length);
                    console.groupEnd();
                    return filtered;
                }
                throw error;
            }
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [BY PUB] Error:', {
                publicationId,
                message: error.message,
                status: error.response?.status,
            });
            console.groupEnd();
            throw new Error('No se pudieron cargar las ofertas de la publicación');
        }
    },

    /**
     * Obtener una oferta por ID
     * GET /offers/{id}
     * Nota: El backend NO incluye publication completo, necesitamos obtenerlo por separado
     */
    getOfferById: async (offerId: string): Promise<Offer> => {
        console.group('🔍 offersService.getOfferById');
        try {
            console.log('🔄 [GET BY ID] Obteniendo oferta:', offerId);

            const response = await apiClient.get<any>(`/offers/${offerId}`);
            const offerData = response.data;

            console.log('✅ [GET BY ID] Oferta encontrada:', {
                status: response.status,
                offerId: offerData.id,
                amount: offerData.amount,
                offerStatus: offerData.status,
                hasPublication: !!offerData.publication,
                publicationId: offerData.publicationId || offerData.publication?.id || 'NO ID',
            });

            console.log('🔍 [GET BY ID] TODOS los campos de la oferta:', offerData);
            console.log('🔍 [GET BY ID] Claves disponibles:', Object.keys(offerData));

            // Si la oferta no tiene publication completo, intentar construirlo
            if (!offerData.publication && offerData.publicationId) {
                console.log('⚠️ [GET BY ID] Oferta sin publication, buscando publicación:', offerData.publicationId);

                // Intentar obtener la publicación del sistema
                try {
                    const { postService } = await import('./postService');
                    const post = await postService.getPostById(offerData.publicationId);
                    offerData.publication = post;
                    console.log('✅ [GET BY ID] Publicación agregada a oferta:', post.title);
                } catch (error) {
                    console.warn('⚠️ [GET BY ID] No se pudo obtener publicación:', error);
                }
            }

            console.groupEnd();
            return offerData as Offer;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [GET BY ID] Error:', {
                offerId,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Oferta no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo cargar la oferta');
        }
    },

    /**
     * Crear nueva oferta
     * POST /offers/new
     * Requiere: Authorization header (automático con interceptor)
     * Body: { publicationId, amount, message }
     */
    createOffer: async (data: CreateOfferRequest): Promise<Offer> => {
        console.group('➕ offersService.createOffer');
        try {
            const userId = await storage.getItem(STORAGE_KEYS.user_id);
            const token = await storage.getItem(STORAGE_KEYS.token);

            console.log('🔄 [CREATE] Creando nueva oferta');
            console.log('📦 [CREATE] Payload:', JSON.stringify(data, null, 2));
            console.log('🔑 [CREATE] Token disponible:', token ? `${token.substring(0, 40)}...` : 'NO TOKEN');
            console.log('👤 [CREATE] User ID:', userId);

            const response = await apiClient.post('/offers/new', data);

            console.log('✅ [CREATE] Respuesta recibida:', {
                status: response.status,
                responseType: typeof response.data,
                hasData: !!response.data,
            });

            // El backend puede devolver la oferta completa o un objeto con la oferta anidada
            const createdOffer = response.data.offer || response.data;

            console.log('✅ [CREATE] Oferta creada:', {
                offerId: createdOffer.id,
                amount: createdOffer.amount,
                publicationId: createdOffer.publication?.id || data.publicationId,
            });

            console.groupEnd();
            return createdOffer;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [CREATE] Error:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                payload: data,
            });

            if (error.response?.data) {
                console.error('🔍 [CREATE] Backend error details:', JSON.stringify(error.response.data, null, 2));
            }

            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Publicación no encontrada');
            }
            if (error.response?.status === 400) {
                const backendMessage = error.response?.data?.message || error.response?.data?.error;
                throw new Error(backendMessage || 'Datos inválidos. Verifica que todos los campos estén correctos.');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo crear la oferta. Intenta nuevamente.');
        }
    },

    /**
     * Actualizar oferta existente
     * 🚨 WORKAROUND: DELETE + POST (PUT no funciona en backend) 🚨
     * TODO: Reemplazar con PUT /offers/update cuando backend lo arregle
     *
     * Estrategia:
     * 1. Obtener oferta actual completa (para tener publicationId)
     * 2. Eliminar oferta existente (DELETE /offers/{id})
     * 3. Crear nueva oferta con datos actualizados (POST /offers/new)
     */
    updateOffer: async (data: UpdateOfferRequest): Promise<Offer> => {
        console.group('✏️ offersService.updateOffer [DELETE+POST WORKAROUND]');
        console.log('🎯 [UPDATE] Datos recibidos:', JSON.stringify(data, null, 2));
        console.warn('⚠️ [WORKAROUND] Usando DELETE+POST porque PUT no funciona');

        try {
            // PASO 1: Obtener oferta actual para tener todos los datos
            console.log('🔄 [UPDATE] PASO 1: Obteniendo oferta actual...');
            const currentOffer = await offersService.getOfferById(data.id);

            console.log('✅ [UPDATE] Oferta actual obtenida:', {
                offerId: currentOffer.id,
                currentAmount: currentOffer.amount,
                currentMessage: currentOffer.message,
                currentStatus: currentOffer.status,
                publicationId: currentOffer.publicationId || currentOffer.publication?.id,
            });

            // Verificar que tenemos publicationId
            const publicationId = currentOffer.publicationId || currentOffer.publication?.id;
            if (!publicationId) {
                throw new Error('No se pudo obtener el ID de la publicación de la oferta actual');
            }

            // PASO 2: Eliminar oferta existente
            console.log('🔄 [UPDATE] PASO 2: Eliminando oferta existente...');
            await offersService.deleteOffer(data.id);
            console.log('✅ [UPDATE] Oferta eliminada exitosamente');

            // PASO 3: Crear nueva oferta con datos actualizados
            console.log('🔄 [UPDATE] PASO 3: Creando nueva oferta con datos actualizados...');
            const createPayload: CreateOfferRequest = {
                publicationId: publicationId,
                amount: data.amount,
                message: data.message,
            };

            console.log('📦 [UPDATE] Payload para crear:', JSON.stringify(createPayload, null, 2));
            const newOffer = await offersService.createOffer(createPayload);

            console.log('✅ [UPDATE] Nueva oferta creada exitosamente:', {
                newOfferId: newOffer.id,
                amount: newOffer.amount,
                status: newOffer.status,
            });

            // Si había un estado mockeado para la oferta vieja, transferirlo a la nueva
            const mockedStatuses = await getMockedOfferStatuses();
            if (mockedStatuses[data.id] && data.status) {
                console.log(`🎭 [UPDATE] Transfiriendo estado mockeado de ${data.id} a ${newOffer.id}`);
                await saveMockedOfferStatus(newOffer.id, data.status);
                // Limpiar estado de oferta vieja
                delete mockedStatuses[data.id];
                await storage.setItem(MOCK_OFFERS_STATUS_CACHE_KEY, JSON.stringify(mockedStatuses));
            }

            console.log('✅ [UPDATE] Actualización completada (DELETE+POST)');
            console.groupEnd();
            return newOffer;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [UPDATE] Error completo:', {
                name: error.name,
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                backendData: error.response?.data,
                backendMessage: error.response?.data?.message,
                backendError: error.response?.data?.error,
            });
            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Oferta no encontrada');
            }
            if (error.response?.status === 400) {
                const backendMsg = error.response?.data?.message || error.response?.data?.error;
                throw new Error(backendMsg || 'Datos inválidos. Verifica que todos los campos estén correctos.');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            if (error.response?.status === 500) {
                const backendMsg = error.response?.data?.message || error.response?.data?.error;
                throw new Error(backendMsg || 'Error en el servidor. Intenta nuevamente.');
            }

            throw error;
        }
    },

    /**
     * Eliminar oferta
     * DELETE /offers/{id}
     * UUID en path param
     */
    deleteOffer: async (offerId: string): Promise<void> => {
        console.group('🗑️ offersService.deleteOffer');
        try {
            console.log('🔄 [DELETE] Eliminando oferta:', offerId);

            const response = await apiClient.delete(`/offers/${offerId}`);

            console.log('✅ [DELETE] Oferta eliminada:', {
                status: response.status,
                statusText: response.statusText,
                offerId,
            });

            console.groupEnd();
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [DELETE] Error:', {
                offerId,
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            console.groupEnd();

            if (error.response?.status === 404) {
                throw new Error('Oferta no encontrada');
            }
            if (error.response?.status === 401) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            throw new Error('No se pudo eliminar la oferta');
        }
    },

    /**
     * Aceptar oferta
     * 🚨 IMPLEMENTACIÓN MOCK - NO LLAMA AL BACKEND 🚨
     * TODO: Reemplazar con llamada real a updateOffer cuando backend funcione
     * Actualmente solo simula la aceptación actualizando el estado local
     */
    acceptOffer: async (offerId: string): Promise<Offer> => {
        console.group('✅ offersService.acceptOffer [MOCK]');
        try {
            console.log('🔄 [ACCEPT MOCK] Aceptando oferta localmente:', offerId);
            console.warn('⚠️ [MOCK] Esta es una simulación - NO se envía al backend');

            const currentOffer = await offersService.getOfferById(offerId);
            console.log('📋 [ACCEPT MOCK] Oferta actual:', JSON.stringify(currentOffer, null, 2));

            // 🚨 MOCK: Guardar estado en caché local
            await saveMockedOfferStatus(offerId, 'ACCEPTED');

            // 🚨 MOCK: Simular actualización sin llamar al backend
            const mockUpdatedOffer: Offer = {
                ...currentOffer,
                status: 'ACCEPTED',
            };

            console.log('✅ [ACCEPT MOCK] Oferta aceptada LOCALMENTE y guardada en caché');
            console.groupEnd();
            return mockUpdatedOffer;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [ACCEPT MOCK] Error:', error.message);
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Rechazar oferta
     * 🚨 IMPLEMENTACIÓN MOCK - NO LLAMA AL BACKEND 🚨
     * TODO: Reemplazar con llamada real a updateOffer cuando backend funcione
     * Actualmente solo simula el rechazo actualizando el estado local
     */
    rejectOffer: async (offerId: string): Promise<Offer> => {
        console.group('❌ offersService.rejectOffer [MOCK]');
        try {
            console.log('🔄 [REJECT MOCK] Rechazando oferta localmente:', offerId);
            console.warn('⚠️ [MOCK] Esta es una simulación - NO se envía al backend');

            const currentOffer = await offersService.getOfferById(offerId);
            console.log('📋 [REJECT MOCK] Oferta actual:', JSON.stringify(currentOffer, null, 2));

            // 🚨 MOCK: Guardar estado en caché local
            await saveMockedOfferStatus(offerId, 'REJECTED');

            // 🚨 MOCK: Simular actualización sin llamar al backend
            const mockUpdatedOffer: Offer = {
                ...currentOffer,
                status: 'REJECTED',
            };

            console.log('✅ [REJECT MOCK] Oferta rechazada LOCALMENTE y guardada en caché');
            console.groupEnd();
            return mockUpdatedOffer;
            // biome-ignore lint/suspicious/noExplicitAny: Error handling
        } catch (error: any) {
            console.error('❌ [REJECT MOCK] Error:', error.message);
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Filtrar ofertas por estado
     * Utility function para filtrado local
     */
    filterOffersByStatus: (offers: Offer[], status?: OfferStatus): Offer[] => {
        if (!status) {
            return offers;
        }
        return offers.filter((offer) => offer.status === status);
    },
};
