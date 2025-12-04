import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter, usePathname } from 'expo-router';
import { Colors, FontSize, Spacing } from '@/src/constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const isGenerator = user?.role === 'GENERATOR';

    // Tabs dinámicos por role
    const tabs = isGenerator
        ? [
            { label: 'Inicio', icon: 'home', route: '/dashboard' },
            { label: 'Publicar', icon: 'add-box', route: '/dashboard/publish' },
            { label: 'Ofertas', icon: 'receipt-long', route: '/dashboard/offers' },
            { label: 'Transacciones', icon: 'swap-horiz', route: '/dashboard/transactions' },
            { label: 'Perfil', icon: 'person', route: '/dashboard/profile' },
        ]
        : [
            { label: 'Inicio', icon: 'search', route: '/dashboard/search' },  // Inicio = search para recycler
            { label: 'Ofertas', icon: 'receipt-long', route: '/dashboard/offers' },
            { label: 'Transacciones', icon: 'swap-horiz', route: '/dashboard/transactions' },
            { label: 'Perfil', icon: 'person', route: '/dashboard/profile' },
        ];  // Omitido "Buscar" — no funcional aún

    return (
        <View style={styles.nav}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.route;
                return (
                    <Pressable
                        key={tab.label}
                        onPress={() => router.replace(tab.route)}
                        style={[styles.tab, !isActive && styles.tabInactive]}  // Deshabilitado visual si needed
                    >
                        <MaterialIcons name={tab.icon} size={24} color={isActive ? Colors.ecoGreen : Colors.gray} />
                        <Text style={[styles.tabText, { color: isActive ? Colors.ecoGreen : Colors.gray }]}>{tab.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = {
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.sm,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: Colors.gray,
    },
    tab: {
        alignItems: 'center',
        gap: Spacing.xs / 2,
        opacity: 1,  // Full para active/habilitado
    },
    tabInactive: {
        opacity: 0.5,  // Si quieres deshabilitar visualmente algún tab futuro
    },
    tabText: {
        fontSize: FontSize.small - 2,
        fontWeight: '500',
    },
};