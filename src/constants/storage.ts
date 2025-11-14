/**
 * Claves para almacenamiento seguro (SecureStore)
 * Basado en el schema User del backend
 */
export const STORAGE_KEYS = {
    token: 'EconexionToken',
    user_id: 'EconexionUserId',
    user_enterprise_name: 'EconexionEnterpriseName',
    user_username: 'EconexionUsername',
    user_nit: 'EconexionNit',
    user_email: 'EconexionEmail',
    user_rol: 'EconexionRol',
} as const;

/**
 * Tipo para las claves de almacenamiento
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
