export type Role = 'COMPRADOR' | 'VENDEDOR' | 'GENERADOR';

export interface RegisterForm {
    enterpriseName: string;
    username: string;
    nit?: string;
    email: string;
    role: Role;
}

export interface RegisterFormErrors {
    enterpriseName?: string;
    username?: string;
    nit?: string;
    email?: string;
    role?: string;
}

// Formulario Google con datos del backend
export interface GoogleRegisterRequest {
    enterpriseName: string;
    username: string;
    nit: string;
    email: string;
    role: string;
}

export const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const MAX_PHOTO_SIZE_MB = 5; // ajustar según DB
