import { AIChatFAB, AIChatModal } from '@/src/components';
import { useUserDataForAI } from '@/src/hooks';
import React, { useState } from 'react';

/**
 * Componente wrapper que incluye el FAB y el Modal de chat IA
 * Agregar este componente en el layout principal de tabs
 */
export default function AIChatWrapper() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { userData, refresh } = useUserDataForAI();

    const handleOpenChat = () => {
        refresh(); // Refrescar datos antes de abrir
        setIsChatOpen(true);
    };

    return (
        <>
            <AIChatFAB onPress={handleOpenChat} />
            <AIChatModal
                visible={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                userData={userData}
            />
        </>
    );
}
