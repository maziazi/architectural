import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface MaterialDetail {
    id: string;
    name: string;
    type: string;
    span_min: number;
    span_max: number;
    depth_min: number;
    depth_max: number;
    description: string;
    characteristics: string[];
    suitable_for: string[];
    limitations: string[];
}

export default function MaterialDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [material, setMaterial] = useState<MaterialDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchMaterial();
    }, [id]);

    const fetchMaterial = async () => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching material:", error);
            } else {
                setMaterial(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: material?.name || "Detail Material",
                    headerBackTitle: "Material",
                }}
            />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#135bec" />
                </View>
            ) : !material ? (
                <View style={styles.center}>
                    <Text>Material tidak ditemukan.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{material.name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{material.type}</Text>
                        </View>
                    </View>

                    {/* Key Metrics Grid */}
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Rentang Bentang</Text>
                            <Text style={styles.value}>
                                {material.span_min && material.span_max
                                    ? `${material.span_min}m - ${material.span_max === 999 ? '∞' : material.span_max + 'm'}`
                                    : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Kedalaman</Text>
                            <Text style={styles.value}>
                                {material.depth_min && material.depth_max
                                    ? `${material.depth_min} - ${material.depth_max} cm`
                                    : material.depth_min ? `${material.depth_min} cm` : 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Deskripsi</Text>
                        <Text style={styles.bodyText}>{material.description}</Text>
                    </View>

                    {/* Characteristics */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Karakteristik</Text>
                        {material.characteristics && material.characteristics.map((char, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.bodyText}>{char}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Suitable For */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cocok Digunakan Untuk</Text>
                        {material.suitable_for && material.suitable_for.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={[styles.bullet, { backgroundColor: "#10b981" }]} />
                                <Text style={styles.bodyText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Limitations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Keterbatasan</Text>
                        {material.limitations && material.limitations.map((limit, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={[styles.bullet, { backgroundColor: "#ef4444" }]} />
                                <Text style={styles.bodyText}>{limit}</Text>
                            </View>
                        ))}
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 20, paddingBottom: 60 },

    headerSection: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8 },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e7ff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    badgeText: { color: "#3730a3", fontWeight: "600", fontSize: 13 },

    grid: {
        flexDirection: "row",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#e5e7eb"
    },
    gridItem: { flex: 1 },
    label: { fontSize: 12, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    value: { fontSize: 16, fontWeight: "700", color: "#1f2937" },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12 },
    bodyText: { fontSize: 16, color: "#4b5563", lineHeight: 24 },

    listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#3b82f6",
        marginTop: 9,
        marginRight: 10
    },
});
