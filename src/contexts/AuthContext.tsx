import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import { useRouter, useSegments } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Verificar auth al inicio y cuando se solicite
    const refreshAuth = async () => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.token);
            setIsAuthenticated(!!token);
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
        }
    };

    // Verificar auth al montar
    useEffect(() => {
        const checkAuth = async () => {
            await refreshAuth();
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Proteger rutas privadas SOLAMENTE
    useEffect(() => {
        if (isLoading) return;

        const currentSegment = segments[0] as string;
        const inAuthGroup = currentSegment === '(tabs)' || currentSegment === 'dashboard';

        // Solo bloquear si NO está autenticado e intenta acceder a ruta privada
        if (!isAuthenticated && inAuthGroup) {
            console.log('❌ No autenticado, bloqueando acceso a', currentSegment);
            router.replace('/');
        }
    }, [isAuthenticated, segments, isLoading]);

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
        <AuthContext.Provider value={{ isAuthenticated, isLoading, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
