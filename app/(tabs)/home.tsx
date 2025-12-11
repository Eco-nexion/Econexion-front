import { AIChatWrapper } from '@/src/components';
import DashboardCard from '@/src/components/DashboardCard';
import { useUserDashboard } from '@/src/hooks/useUserDashboard';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
    const router = useRouter();
    const { userData, stats, isLoading, refreshStats } = useUserDashboard();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshStats();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return '¡Buenos días!';
        }
        if (hour < 19) {
            return '¡Buenas tardes!';
        }
        return '¡Buenas noches!';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading && !userData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={Colors.ecoGreen} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header verde consistente con otras tabs */}
                <View style={styles.headerBar}>
                    <Text style={styles.headerTitle}>Inicio</Text>
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Header con saludo, información y avatar */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.greeting}>{getGreeting()}</Text>
                            <Text style={styles.userName}>{userData?.username || 'Usuario'}</Text>
                            <Text style={styles.userEmail}>{userData?.email || 'correo@ejemplo.com'}</Text>
                        </View>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {userData?.username ? getInitials(userData.username) : 'U'}
                            </Text>
                        </View>
                    </View>

                    {/* Título de sección */}
                    <Text style={styles.sectionTitle}>Acceso rápido</Text>

                    {/* Tarjetas de navegación */}
                    <DashboardCard
                        title='Mis Publicaciones'
                        description='Gestiona tus materiales reciclables publicados'
                        icon='newspaper'
                        count={stats.publications}
                        color={Colors.ecoGreen}
                        onPress={() => router.push('/(tabs)/publications')}
                    />

                    <DashboardCard
                        title='Ofertas Recibidas'
                        description='Revisa las ofertas que has recibido en tus publicaciones'
                        icon='mail'
                        count={stats.offersReceived}
                        color={Colors.cyan}
                        onPress={() => router.push('/(tabs)/offers')}
                    />

                    <DashboardCard
                        title='Ofertas Enviadas'
                        description='Consulta el estado de las ofertas que has enviado'
                        icon='paper-plane'
                        count={stats.offersSent}
                        color={Colors.peach}
                        onPress={() => router.push('/(tabs)/offers')}
                    />

                    <DashboardCard
                        title='Mis Chats'
                        description='Conversaciones activas con otros usuarios'
                        icon='chatbubbles'
                        count={stats.activeChats}
                        color={Colors.limeGreen}
                        onPress={() => router.push('/(tabs)/chat')}
                    />

                    <DashboardCard
                        title='Mi Perfil'
                        description='Edita tu información personal y configuración'
                        icon='person-circle'
                        color='#6B7280'
                        onPress={() => router.push('/(tabs)/profile')}
                    />

                    {/* Espacio al final */}
                    <View style={{ height: Spacing.xl }} />
                </ScrollView>
            </SafeAreaView>
            
            {/* Botón flotante de Asistente IA - Solo visible en Home */}
            <AIChatWrapper />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    headerBar: {
        backgroundColor: Colors.ecoGreen,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: '#fff',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    headerContent: {
        flex: 1,
        gap: Spacing.xs / 2,
    },
    greeting: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    userName: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: Colors.text,
    },
    userEmail: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.ecoGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: '#fff',
    },
    sectionTitle: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
});