import type { Post } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostCardProps {
    post: Post;
    onPress: () => void;
    showActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function PostCard({ post, onPress, showActions = false, onEdit, onDelete }: PostCardProps) {
    console.log('🎴 [PostCard] Renderizando card:', {
        postId: post.id,
        title: post.title,
        showActions,
        hasOnEdit: !!onEdit,
        hasOnDelete: !!onDelete,
    });

    const getMaterialIcon = (material: string): keyof typeof Ionicons.glyphMap => {
        // Normalizar el material (quitar tildes y convertir a minúsculas para comparar)
        const normalized = material
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            pet: 'water-outline',
            carton: 'cube-outline',
            aluminio: 'nutrition-outline',
            vidrio: 'wine-outline',
            papel: 'document-outline',
            plastico: 'flask-outline',
        };

        return icons[normalized] || 'leaf-outline';
    };

    return (
        <View style={styles.card}>
            {/* Botones de acción en esquina superior derecha (solo si showActions = true) */}
            {showActions && (onEdit || onDelete) ? (
                <View style={styles.actionsCorner}>
                    {onEdit ? (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => {
                                console.log('🔵 [PostCard] Botón EDITAR presionado');
                                onEdit();
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name='pencil' size={16} color={Colors.ecoGreen} />
                        </TouchableOpacity>
                    ) : null}
                    {onDelete ? (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => {
                                console.log('🔴 [PostCard] Botón ELIMINAR presionado, postId:', post.id);
                                onDelete();
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name='trash-outline' size={16} color='#DC2626' />
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : null}

            {/* Contenido del card como Pressable */}
            <Pressable onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
                {/* Header con material y badge */}
                <View style={styles.header}>
                    <View style={styles.materialBadge}>
                        <Ionicons name={getMaterialIcon(post.material)} size={20} color={Colors.ecoGreen} />
                        <Text style={styles.materialText}>{post.material}</Text>
                    </View>
                    {post.offers.length > 0 ? (
                        <View style={styles.offersBadge}>
                            <Ionicons name='pricetag' size={14} color='#fff' />
                            <Text style={styles.offersText}>{post.offers.length}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Título */}
                <Text style={styles.title} numberOfLines={2}>
                    {post.title}
                </Text>

                {/* Descripción */}
                <Text style={styles.description} numberOfLines={2}>
                    {post.description}
                </Text>

                {/* Info grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Ionicons name='cube-outline' size={16} color={Colors.gray} />
                        <Text style={styles.infoText}>
                            {post.quantity} {post.quantity === 1 ? 'kg' : 'kg'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name='cash-outline' size={16} color={Colors.gray} />
                        <Text style={styles.infoText}>${post.price.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Ubicación */}
                <View style={styles.location}>
                    <Ionicons name='location-outline' size={14} color={Colors.gray} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {post.location}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.large,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    materialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.lightGray,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs / 2,
        borderRadius: BorderRadius.full,
    },
    materialText: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: Colors.ecoGreen,
    },
    offersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.peach,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs / 2,
        borderRadius: BorderRadius.full,
    },
    offersText: {
        fontSize: FontSize.small,
        fontWeight: '600',
        color: '#fff',
    },
    title: {
        fontSize: FontSize.large,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    description: {
        fontSize: FontSize.medium,
        color: Colors.gray,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs / 2,
    },
    infoText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.text,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs / 2,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    locationText: {
        fontSize: FontSize.small,
        color: Colors.gray,
        flex: 1,
    },
    actionsCorner: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        gap: Spacing.xs,
        zIndex: 999,
        elevation: 999,
        pointerEvents: 'box-none',
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.small,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        pointerEvents: 'auto',
    },
});
