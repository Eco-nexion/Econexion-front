import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Colors, Spacing, FontSize } from '@/src/constants';
import { Post } from '@type/post';

interface PostCardProps {
    post: Post;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function PostCard({ post, onPress, onEdit, onDelete }: PostCardProps) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image
                source={{ uri: post.imageUrl || 'https://trelew.gob.ar/wp-content/uploads/2024/10/ventajas-reciclaje-plastico.jpg' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title}>{post.title || `Lote #${post.id.slice(0, 8)}`}</Text>
                <Text style={styles.subtitle}>{post.material} - {post.quantity} kg</Text>
                <Text style={styles.price}>${post.price}</Text>
            </View>
            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && <Pressable onPress={onEdit}><Text style={styles.actionText}>Edit</Text></Pressable>}
                    {onDelete && <Pressable onPress={onDelete}><Text style={styles.actionText}>Delete</Text></Pressable>}
                </View>
            )}
        </Pressable>
    );
}

const styles = {
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    image: { width: 64, height: 64, borderRadius: 8, marginRight: Spacing.md },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 2 },
    subtitle: { fontSize: 14, color: Colors.gray },
    price: { fontSize: 16, fontWeight: '700', color: Colors.ecoGreen },
    actions: { flexDirection: 'row', gap: Spacing.sm },
    actionText: { color: Colors.ecoGreen, fontWeight: '600' },
};