import { Colors } from '@constants';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.ecoGreen,
                tabBarInactiveTintColor: Colors.gray,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: Colors.ecoGreen,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '700',
                },
            }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    title: 'Inicio',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name='home' size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name='publications'
                options={{
                    title: 'Publicaciones',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name='newspaper-outline' size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name='offers'
                options={{
                    title: 'Ofertas',
                    tabBarIcon: ({ color, size }) => <Ionicons name='pricetag-outline' size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name='chat'
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => <Ionicons name='chatbubbles-outline' size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => <Ionicons name='person' size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
