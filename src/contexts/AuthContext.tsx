import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/authService'; // Ruta relativa

// Types basados en backend
interface User {
    id: string;
    name: string;
    email: string;
    role: 'GENERATOR' | 'RECYCLER';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (data: {
        companyName: string;
        nit?: string;
        userName: string;
        position: string;
        photoUri?: string;
        email: string;
        password: string;
        role: 'GENERATOR' | 'RECYCLER';
    }) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AuthService.getCurrentUser();
                setUser(storedUser);
            } catch (error) {
                console.error('Error loading user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const response = await AuthService.login(email, password);
            setUser(response.user);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Error en el inicio de sesión' };
        }
    };

    const signUp = async (data: {
        companyName: string;
        nit?: string;
        userName: string;
        position: string;
        photoUri?: string;
        email: string;
        password: string;
        role: 'GENERATOR' | 'RECYCLER';
    }) => {
        try {
            await AuthService.register(data); // No setUser (no login)
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || 'Error en el registro' };
        }
    };

    const signOut = async () => {
        try {
            await AuthService.logout();
            setUser(null);
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: !!user,
            loading,
            signIn,
            signUp,
            signOut,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (undefined === context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}