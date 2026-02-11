import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

interface ProjectDetail {
    id: string;
    name: string;
    building_type: string;
    main_span: number;
    column_distance: number;
    created_at: string;
    materials: {
        id: string;
        name: string;
        type: string;
        span_range: string;
        depth: string;
        description: string;
        characteristics: string[];
        suitable_for: string[];
        limitations: string[];
    } | null;
}

export default function ProjectDetailPage() {
    const { id, from } = useLocalSearchParams<{ id: string, from?: string }>();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          materials (*)
        `)
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching project:", error);
            } else {
                setProject(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const material = project?.materials;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Detail Proyek",
                    headerBackTitle: from || "Riwayat",
                }}
            />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#135bec" />
                </View>
            ) : !project ? (
                <View style={styles.center}>
                    <Text>Proyek tidak ditemukan.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Project Info Card */}
                    <View style={styles.projectCard}>
                        <Text style={styles.projectTitle}>{project.name}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <MaterialIcons name="apartment" size={16} color="#6b7280" />
                                <Text style={styles.metaText}>{project.building_type}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
                                <Text style={styles.metaText}>{new Date(project.created_at).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Bentang Utama</Text>
                                <Text style={styles.value}>{project.main_span.toFixed(4)} m</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Jarak Kolom</Text>
                                <Text style={styles.value}>{project.column_distance.toFixed(4)} m</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Material Struktur Terpilih</Text>

                    {material ? (
                        <View style={styles.materialSection}>
                            {/* Header Section */}
                            <View style={styles.headerSection}>
                                <Text style={styles.title}>{material.name}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{material.type}</Text>
                                </View>
                            </View>

                            {/* Key Metrics Grid */}
                            <View style={styles.matGrid}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.label}>Rentang Bentang</Text>
                                    <Text style={styles.value}>{material.span_range}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.label}>Kedalaman</Text>
                                    <Text style={styles.value}>{material.depth}</Text>
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
                        </View>
                    ) : (
                        <Text style={styles.errorText}>Data material tidak tersedia.</Text>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7f8" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 20, paddingBottom: 60 },

    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#e6e9ee",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    projectTitle: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 8 },
    metaRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { color: "#6b7280", fontSize: 14 },
    divider: { height: 1, backgroundColor: "#f3f4f6", marginBottom: 16 },

    sectionHeader: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#374151" },
    materialSection: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: "#e6e9ee",
    },

    headerSection: { marginBottom: 20 },
    title: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e7ff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    badgeText: { color: "#3730a3", fontWeight: "600", fontSize: 13 },

    grid: { flexDirection: "row", justifyContent: "space-between" },
    matGrid: {
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
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
    bodyText: { fontSize: 15, color: "#4b5563", lineHeight: 24 },

    listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#3b82f6",
        marginTop: 9,
        marginRight: 10
    },
    errorText: { color: "#ef4444", fontStyle: "italic" },
});
