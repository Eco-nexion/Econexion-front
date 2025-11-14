import type { Post } from '@/src/types';
import { BorderRadius, Colors, FontSize, Spacing } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PostCardProps {
    post: Post;
    onPress: () => void;
    showActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function PostCard({ post, onPress, showActions = false, onEdit, onDelete }: PostCardProps) {
    const getMaterialIcon = (material: string): keyof typeof Ionicons.glyphMap => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            PET: 'water-outline',
            Cartón: 'cube-outline',
            Aluminio: 'nutrition-outline',
            Vidrio: 'wine-outline',
            Papel: 'document-outline',
            Plástico: 'flask-outline',
        };
        return icons[material] || 'leaf-outline';
    };

    return (
        <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#f0f0f0' }}>
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

            {/* Botones de acción (solo si showActions = true) */}
            {showActions ? (
                <View style={styles.actions}>
                    {onEdit ? (
                        <Pressable
                            style={[styles.actionButton, styles.editButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <Ionicons name='pencil' size={16} color={Colors.ecoGreen} />
                            <Text style={styles.editButtonText}>Editar</Text>
                        </Pressable>
                    ) : null}
                    {onDelete ? (
                        <Pressable
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Ionicons name='trash' size={16} color='#DC2626' />
                            <Text style={styles.deleteButtonText}>Eliminar</Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
        </Pressable>
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
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs / 2,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.medium,
        borderWidth: 1,
    },
    editButton: {
        borderColor: Colors.ecoGreen,
        backgroundColor: '#fff',
    },
    editButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: Colors.ecoGreen,
    },
    deleteButton: {
        borderColor: '#DC2626',
        backgroundColor: '#fff',
    },
    deleteButtonText: {
        fontSize: FontSize.medium,
        fontWeight: '600',
        color: '#DC2626',
    },
});
