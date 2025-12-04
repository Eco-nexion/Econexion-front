import DeleteAccountModal from '@/src/components/DeleteAccountModal';
import EditProfileModal, { type EditProfileData } from '@/src/components/EditProfileModal';
import { useAuth } from '@/src/contexts/AuthContext';
import { userService } from '@/src/services';
import type { UserData } from '@/src/types';
import { USER_TYPE_LABELS } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing, STORAGE_KEYS } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@utils';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileTab() {
    const { logout } = useAuth();
    const [userData, setUserData] = useState<UserData>({
        id: '',
        enterpriseName: '',
        username: '',
        nit: '',
        email: '',
        rol: '',
    });
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            const id = (await storage.getItem(STORAGE_KEYS.user_id)) || '';
            const enterpriseName = (await storage.getItem(STORAGE_KEYS.user_enterprise_name)) || 'Empresa';
            const username = (await storage.getItem(STORAGE_KEYS.user_username)) || 'Usuario';
            const nit = (await storage.getItem(STORAGE_KEYS.user_nit)) || '';
            const email = (await storage.getItem(STORAGE_KEYS.user_email)) || 'correo@ejemplo.com';
            const rol = (await storage.getItem(STORAGE_KEYS.user_rol)) || 'usuario';
            setUserData({ id, enterpriseName, username, nit, email, rol });
        };

        loadUserData();
    }, []);

    const handleEditProfile = async (data: EditProfileData) => {
        // TODO: Llamar al endpoint PUT /lab/users/update/{id}
        const updatedUser = await userService.updateUser(userData.id, data);

        // Actualizar storage
        await storage.setItem(STORAGE_KEYS.user_enterprise_name, updatedUser.enterpriseName);
        await storage.setItem(STORAGE_KEYS.user_username, updatedUser.username);
        if (updatedUser.nit) {
            await storage.setItem(STORAGE_KEYS.user_nit, updatedUser.nit);
        }
        await storage.setItem(STORAGE_KEYS.user_email, updatedUser.email);

        // Actualizar estado local
        setUserData(updatedUser);
    };

    const handleDeleteAccount = async () => {
        try {
            // TODO: Cuando el backend esté listo, descomentar esta línea
            // await userService.deleteUser(userData.id);

            // Mostrar confirmación y cerrar sesión
            Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada exitosamente');
            await logout();
        } catch (error: unknown) {
            // Si el backend retorna error
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la cuenta';
            throw new Error(errorMessage);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const getUserTypeLabel = (type: string) => {
        return USER_TYPE_LABELS[type] || type;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header con avatar y datos */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(userData.username)}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{userData.username}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{getUserTypeLabel(userData.rol)}</Text>
                    </View>
                </View>

                {/* Sección Cuenta */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mi Cuenta</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon='person-outline'
                            title='Información Personal'
                            subtitle='Edita tu nombre, foto de perfil'
                            onPress={() => setEditModalVisible(true)}
                        />
                        <Divider />
                        <SettingItem icon='mail-outline' title='Correo Electrónico' subtitle={userData.email} />
                        <Divider />
                        {/* TODO: Detectar proveedor de auth (google/local) para permitir cambiar contraseña */}
                        <SettingItem
                            icon='lock-closed-outline'
                            title='Contraseña'
                            subtitle='Cambia tu contraseña'
                            onPress={() => console.log('Contraseña')}
                        />
                    </View>
                </View>

                {/* Sección Configuración */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configuración</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon='notifications-outline'
                            title='Notificaciones'
                            subtitle='Gestiona tus alertas'
                            onPress={() => console.log('Notificaciones')}
                        />
                        <Divider />
                        <SettingItem
                            icon='shield-checkmark-outline'
                            title='Privacidad'
                            subtitle='Controla tu información'
                            onPress={() => console.log('Privacidad')}
                        />
                        <Divider />
                        <SettingItem
                            icon='language-outline'
                            title='Idioma'
                            subtitle='Español'
                            onPress={() => console.log('Idioma')}
                        />
                    </View>
                </View>

                {/* Sección Sostenibilidad */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sostenibilidad</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon='leaf-outline'
                            title='Mis Iniciativas'
                            subtitle='Proyectos ecológicos'
                            onPress={() => console.log('Iniciativas')}
                            iconColor={Colors.ecoGreen}
                        />
                        <Divider />
                        <SettingItem
                            icon='stats-chart-outline'
                            title='Impacto Ambiental'
                            subtitle='Revisa tu contribución'
                            onPress={() => console.log('Impacto')}
                            iconColor={Colors.ecoGreen}
                        />
                    </View>
                </View>

                {/* Sección Soporte */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Soporte</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon='help-circle-outline'
                            title='Ayuda y Soporte'
                            subtitle='Centro de ayuda'
                            onPress={() => console.log('Ayuda')}
                        />
                        <Divider />
                        <SettingItem
                            icon='information-circle-outline'
                            title='Acerca de Econexion'
                            subtitle='Versión 1.0.0'
                            onPress={() => console.log('Acerca de')}
                        />
                        <Divider />
                        <SettingItem
                            icon='trash-outline'
                            title='Eliminar Cuenta'
                            subtitle='Eliminar permanentemente tu cuenta'
                            onPress={() => setDeleteModalVisible(true)}
                            iconColor='#DC2626'
                        />
                    </View>
                </View>

                {/* Botón Cerrar Sesión */}
                <View style={styles.section}>
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name='log-out-outline' size={20} color='#fff' />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Econexion © 2025</Text>
                </View>
            </ScrollView>

            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleEditProfile}
                initialData={{
                    enterpriseName: userData.enterpriseName,
                    username: userData.username,
                    nit: userData.nit || '',
                    email: userData.email,
                }}
            />

            <DeleteAccountModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteAccount}
                userEmail={userData.email}
            />
        </SafeAreaView>
    );
}

interface SettingItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress?: () => void;
    iconColor?: string;
}

function SettingItem({ icon, title, subtitle, onPress, iconColor = Colors.gray }: SettingItemProps) {
    const Container = onPress ? Pressable : View;
    const containerProps = onPress ? { onPress, android_ripple: { color: '#f0f0f0' } } : {};

    return (
        <Container style={styles.settingItem} {...containerProps}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            {onPress ? <Ionicons name='chevron-forward' size={20} color={Colors.gray} /> : null}
        </Container>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: Colors.ecoGreen,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: BorderRadius.xlarge,
        borderBottomRightRadius: BorderRadius.xlarge,
    },
    avatarContainer: {
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: FontSize.xxxlarge,
        fontWeight: '700',
        color: Colors.ecoGreen,
    },
    userName: {
        fontSize: FontSize.xlarge,
        fontWeight: '700',
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    userEmail: {
        fontSize: FontSize.medium,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: Spacing.md,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    badgeText: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.medium,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.sm,
        paddingLeft: Spacing.xs,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.large,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        minHeight: 64,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.medium,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs / 2,
    },
    settingSubtitle: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.lightGray,
        marginLeft: 72, // Alineado con el texto (40 + 16 + 16)
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#DC2626',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: FontSize.medium,
    },
    footer: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: FontSize.small,
        color: Colors.gray,
    },
});
