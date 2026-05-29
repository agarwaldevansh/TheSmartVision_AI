import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const MenuCard = ({ title, icon, colors, description, onPress }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                <View style={styles.cardInfo}>
                    <MaterialCommunityIcons name={icon} size={32} color="#fff" />
                    <View style={styles.textColumn}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardDesc}>{description}</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="arrow-right-circle" size={25} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <View style={styles.bgGlow} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. HEADER  */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.userName}>User</Text>
                    </View>
                    <TouchableOpacity style={styles.profileGlow}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                            style={styles.profilePhoto}
                        />
                    </TouchableOpacity>
                </View>

                {/* 2. BRAND BOX  */}
                <View style={styles.brandBox}>

                    <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.logoContainerSquare}>
                        <Image
                            source={require('../assets/app_logo.png')}
                            style={styles.mainLogo}
                            resizeMode="contain"
                        />
                    </LinearGradient>
                    <Text style={styles.brandName}>SmartVision <Text style={styles.aiTag}>AI</Text></Text>
                </View>

                {/* 3. FEATURE CARDS */}
                <View style={styles.menuGrid}>
                    <MenuCard
                        title="Extract Text"
                        icon="text-search"
                        colors={['#4facfe', '#00f2fe']}
                        description="Convert images or handwriting to digital text."
                        onPress={() => navigation.navigate('Text')}
                    />
                    <MenuCard
                        title="Predict Digit"
                        icon="matrix"
                        colors={['#43e97b', '#38f9d7']}
                        description="Identify hand-drawn numbers instantly."
                        onPress={() => navigation.navigate('Digit')}
                    />
                    <MenuCard
                        title="Object Detection"
                        icon="eye-outline"
                        colors={['#fa709a', '#fee140']}
                        description="Find and name objects in your photos."
                        onPress={() => navigation.navigate('Object')}
                    />
                </View>
                <Text style={styles.footerText}>POWERED BY SMARTVISION ENGINE</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#0f172a' },
    bgGlow: { position: 'absolute', top: -100, right: -100, width: 265, height: 265, borderRadius: 150, backgroundColor: '#3b82f6', opacity: 0.1 },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: 60 },
    greeting: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    userName: { color: '#f8fafc', fontSize: 24, fontWeight: '900' },
    profileGlow: { padding: 2, backgroundColor: '#334155', borderRadius: 35 },
    profilePhoto: { width: 60, height: 60, borderRadius: 22, borderWidth: 2, borderColor: '#38bdf8' },
    brandBox: { alignItems: 'center', marginVertical: 30 },


    logoContainerSquare: {
        width: 90,
        height: 90,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 25,
        shadowColor: '#6366f1',
        shadowOpacity: 0.6,
        shadowRadius: 20
    },

    mainLogo: { width: 60, height: 60 },
    brandName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12, letterSpacing: 1 },
    aiTag: { color: '#38bdf8' },
    menuGrid: { paddingHorizontal: 20 },
    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 24, marginBottom: 15 },
    cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    textColumn: { marginLeft: 15 },
    cardTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    cardDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 3 },
    footerText: { textAlign: 'center', color: '#334155', fontSize: 9, letterSpacing: 3, marginTop: 30 }
});