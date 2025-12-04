export function parseJwt(token: string): { id: string; name: string; email: string; role: 'GENERATOR' | 'RECYCLER' } | null {
    try {
        const base64Url = token.split('.')[1]; // Payload
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const claims = JSON.parse(jsonPayload);
        // Ajustado: Usa sub para email (como en backend); mapea username -> name
        return {
            id: claims.id || '',
            name: claims.username || '',
            email: claims.sub || '',  // Cambiado: sub es el email
            role: (claims.rol || '').toUpperCase() as 'GENERATOR' | 'RECYCLER',
        };
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}