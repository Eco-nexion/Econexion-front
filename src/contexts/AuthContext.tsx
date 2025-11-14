import type { UserData } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import { useRouter, useSegments } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: UserData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Verificar auth al inicio
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await storage.getItem(STORAGE_KEYS.token);
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('Error checking auth:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Proteger rutas según estado de auth
    useEffect(() => {
        if (isLoading) {
            return;
        }

        const currentSegment = segments[0] as string;
        const inAuthGroup = currentSegment === '(tabs)' || currentSegment === 'dashboard';

        if (!isAuthenticated && inAuthGroup) {
            // Usuario no autenticado → redirigir a inicio
            router.replace('/');
        } else if (isAuthenticated && (!currentSegment || currentSegment === 'index')) {
            // Usuario autenticado en raíz o index → redirigir a tabs
            router.replace('/(tabs)/home');
        }
    }, [isAuthenticated, segments, isLoading, router]);

    const login = async (token: string, userData: UserData) => {
        await storage.setItem(STORAGE_KEYS.token, token);
        await storage.setItem(STORAGE_KEYS.user_id, userData.id);
        await storage.setItem(STORAGE_KEYS.user_enterprise_name, userData.enterpriseName);
        await storage.setItem(STORAGE_KEYS.user_username, userData.username);
        if (userData.nit) {
            await storage.setItem(STORAGE_KEYS.user_nit, userData.nit);
        }
        await storage.setItem(STORAGE_KEYS.user_email, userData.email);
        await storage.setItem(STORAGE_KEYS.user_rol, userData.rol);
        setIsAuthenticated(true);
        router.replace('/(tabs)/home');
    };

    const logout = async () => {
        await storage.removeItem(STORAGE_KEYS.token);
        await storage.removeItem(STORAGE_KEYS.user_id);
        await storage.removeItem(STORAGE_KEYS.user_enterprise_name);
        await storage.removeItem(STORAGE_KEYS.user_username);
        await storage.removeItem(STORAGE_KEYS.user_nit);
        await storage.removeItem(STORAGE_KEYS.user_email);
        await storage.removeItem(STORAGE_KEYS.user_rol);
        setIsAuthenticated(false);
        router.replace('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
