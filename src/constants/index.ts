// Global constants for the application

// Brand and UI colors aligned with the Econexion palette
export const Colors = {
    ecoGreen: '#3B9C3F', // Verde Principal
    limeGreen: '#82C787', // Verde Lima/Claro
    cyan: '#4FC3F7', // Azul Turquesa/Cian
    peach: '#FFAB40', // Naranja Suave/Melocotón
    lightGray: '#F0F0F0', // Gris Claro Suave

    // Common aliases / defaults
    primary: '#3B9C3F',
    text: '#000000',
    background: '#FFFFFF',
    gray: '#8E8E93',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const FontSize = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxxlarge: 32,
};

export const BorderRadius = {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    full: 9999,
};

export * from './storage';

/**
 * Materiales reciclables disponibles en la plataforma
 * IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con el backend (sin tildes)
 */
export const Materials = {
    pet: 'PET',
    carton: 'Carton', // Sin tilde
    aluminio: 'Aluminio',
    vidrio: 'Vidrio',
    papel: 'Papel',
    plastico: 'Plastico', // Sin tilde
} as const;

export type MaterialType = (typeof Materials)[keyof typeof Materials];

/**
 * API Configuration
 * Lee desde variables de entorno EXPO_PUBLIC_*
 * Fallback a localhost para desarrollo local
 */
export const API_CONFIG = {
    // biome-ignore lint/style/useNamingConvention: API constants convention
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    // biome-ignore lint/style/useNamingConvention: API constants convention
    TIMEOUT: Number.parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
} as const;
