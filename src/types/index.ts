// TypeScript type definitions

export { isEmailValid, MAX_PHOTO_SIZE_MB } from './forms';
export type { RegisterForm, RegisterFormErrors, Role } from './forms';

/**
 * Datos del usuario almacenados localmente
 * Basado en el schema User del backend
 */
export interface UserData {
    id: string;
    enterpriseName: string;
    username: string;
    nit?: string;
    email: string;
    rol: string;
}

/**
 * Labels legibles para los tipos de usuario
 */
export const USER_TYPE_LABELS: Record<string, string> = {
    compra: 'Comprador',
    comprador: 'Comprador',
    vende: 'Vendedor',
    vendedor: 'Vendedor',
    genera: 'Generador',
    generador: 'Generador',
} as const;
