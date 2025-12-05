import { Stack } from 'expo-router';
import BottomNav from '@/src/components/BottomNav';
import { View } from "react-native";

export default function DashboardLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            <BottomNav />
        </View>
    );
}