import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Colors, Spacing, FontSize } from '@/src/constants';
import { Offer } from '@type/offer';

interface OfferCardProps {
    offer: Offer;
    onPress: () => void;
    onUpdate?: () => void;
    onDelete?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
}

export default function OfferCard({ offer, onPress, onUpdate, onDelete, onAccept, onReject }: OfferCardProps) {
    return (
        <Pressable style={[styles.card, offer.status !== 'PENDING' && styles.completed]} onPress={onPress}>
            <Image
                source={{ uri: offer.publication?.imageUrl || 'https://img.freepik.com/vector-gratis/moneda-oro-dinero-flotante-vector-dibujos-animados-icono-ilustracion-finanzas-empresariales-vector-plano-aislado_138676-11049.jpg?semt=ais_hybrid&w=740&q=80' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title}>Oferta #{offer.id.slice(0, 8)}</Text>
                <Text style={styles.subtitle}>Mensaje: {offer.message}</Text>
            </View>
            <Text style={styles.price}>${offer.amount}</Text>
            {(onUpdate || onDelete || onAccept || onReject) && (
                <View style={styles.actions}>
                    {onUpdate && <Pressable onPress={onUpdate}><Text style={styles.actionText}>Renegociar</Text></Pressable>}
                    {onDelete && <Pressable onPress={onDelete}><Text style={styles.actionText}>Borrar</Text></Pressable>}
                    {onAccept && <Pressable onPress={onAccept}><Text style={styles.actionText}>Aceptar</Text></Pressable>}
                    {onReject && <Pressable onPress={onReject}><Text style={styles.actionText}>Rechazar</Text></Pressable>}
                </View>
            )}
        </Pressable>
    );
}

const styles = {
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    completed: { opacity: 0.7 },
    image: { width: 56, height: 56, borderRadius: 8, marginRight: Spacing.md },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 2 },
    subtitle: { fontSize: 14, color: '#666' },
    price: { fontSize: 18, fontWeight: '700', color: Colors.ecoGreen, paddingRight: 15 },
    actions: { flexDirection: 'row', gap: Spacing.sm },
    actionText: { color: Colors.ecoGreen, fontWeight: '600' },
};