import type { UserData } from '@/src/types';
import { STORAGE_KEYS } from '@constants';
import { storage } from '@utils';
import { useEffect, useState } from 'react';

interface DashboardStats {
    publications: number;
    offersReceived: number;
    offersSent: number;
    activeChats: number;
}

interface UseDashboardReturn {
    userData: UserData | null;
    stats: DashboardStats;
    isLoading: boolean;
    refreshStats: () => Promise<void>;
}

export function useUserDashboard(): UseDashboardReturn {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        publications: 0,
        offersReceived: 0,
        offersSent: 0,
        activeChats: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadUserData = async () => {
        try {
            const id = (await storage.getItem(STORAGE_KEYS.user_id)) || '';
            const enterpriseName = (await storage.getItem(STORAGE_KEYS.user_enterprise_name)) || '';
            const username = (await storage.getItem(STORAGE_KEYS.user_username)) || '';
            const nit = (await storage.getItem(STORAGE_KEYS.user_nit)) || undefined;
            const email = (await storage.getItem(STORAGE_KEYS.user_email)) || '';
            const rol = (await storage.getItem(STORAGE_KEYS.user_rol)) || '';

            setUserData({ id, enterpriseName, username, nit, email, rol });
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadStats = async () => {
        // TODO: Cuando el backend tenga endpoint /dashboard/stats, reemplazar con:
        // const response = await apiClient.get('/dashboard/stats');
        // setStats(response.data);

        // Por ahora, stats simples sin llamadas al backend
        // El usuario verá 0 hasta que navegue y cargue datos reales
        setStats({
            publications: 0,
            offersReceived: 0,
            offersSent: 0,
            activeChats: 0,
        });
    };

    const refreshStats = async () => {
        setIsLoading(true);
        await Promise.all([loadUserData(), loadStats()]);
        setIsLoading(false);
    };

    useEffect(() => {
        refreshStats();
    }, []);

    return { userData, stats, isLoading, refreshStats };
}
