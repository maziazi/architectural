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
    num_floors?: number;
    floor_height?: number;
    description: string;
    created_at: string;
    materials: {
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

                        {project.description && (
                            <View style={styles.descSection}>
                                <Text style={styles.descLabel}>Deskripsi Fungsi</Text>
                                <Text style={styles.descText}>{project.description}</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Bentang</Text>
                                <Text style={styles.value}>{project.main_span.toFixed(2)} m</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Jarak Kolom</Text>
                                <Text style={styles.value}>{project.column_distance.toFixed(2)} m</Text>
                            </View>
                        </View>

                        <View style={[styles.grid, { marginTop: 12 }]}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Jumlah Lantai</Text>
                                <Text style={styles.value}>{project.num_floors || 1} Lt</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Tinggi /Lantai</Text>
                                <Text style={styles.value}>{(project.floor_height || 3.5).toFixed(2)} m</Text>
                            </View>
                        </View>

                        {/* Deterministic Structural Sizing */}
                        {(() => {
                            const span = project.main_span;
                            const spacing = project.column_distance;
                            const functionType = project.building_type;
                            const mat = project.materials;

                            if (!mat) return null;

                            // Material-Specific Beam Height Calculation (Linear scaling from DB reference)
                            let matBeamHeightMin = 0;
                            let matBeamHeightMax = 0;

                            const itemEfficiencyRatio = (mat.depth_min && mat.span_min) ? ((mat.depth_min / 100) / mat.span_min) : (1 / 20);

                            matBeamHeightMin = span * (itemEfficiencyRatio * 100);

                            const maxRatio = (mat.depth_max && mat.span_max && mat.span_max < 900)
                                ? ((mat.depth_max / 100) / mat.span_max)
                                : (mat.depth_max && mat.span_min) ? ((mat.depth_max / 100) / mat.span_min) : itemEfficiencyRatio * 1.2;

                            matBeamHeightMax = span * (maxRatio * 100);

                            // Adjust based on building function (load)
                            if (functionType !== "Hunian") {
                                const multiplier = functionType === "Kantor" ? 1.15 : 1.25;
                                matBeamHeightMin *= multiplier;
                                matBeamHeightMax *= multiplier;
                            }

                            // Material-Specific Column Calculation
                            const floors = project.num_floors || 1;
                            const height = project.floor_height || 3.5;
                            const tributaryArea = span * spacing;
                            let loadFactor = 1.0;
                            if (functionType === "Hunian") loadFactor = 1.0;
                            else if (functionType === "Kantor") loadFactor = 1.3;
                            else if (functionType === "Sekolah" || functionType === "Publik") loadFactor = 1.6;

                            let baseTypeFactor = 15;
                            let standardRatio = 0.05;

                            if (mat.type === "Baja") {
                                baseTypeFactor = 4;
                                standardRatio = 0.04;
                            } else if (mat.type === "Kayu") {
                                baseTypeFactor = 22;
                                standardRatio = 0.06;
                            } else if (mat.type === "Bata") {
                                baseTypeFactor = 35;
                                standardRatio = 0.1;
                            }

                            const adjustment = itemEfficiencyRatio / standardRatio;

                            // Slenderness Factor (Buckling)
                            let slendernessFactor = 1.0;
                            if (height > 3.5) {
                                slendernessFactor = 1.0 + ((height - 3.5) / 0.5) * 0.05;
                            }

                            const matColumnArea = tributaryArea * loadFactor * baseTypeFactor * adjustment * floors * slendernessFactor;
                            const matColumnDim = Math.sqrt(matColumnArea);

                            return (
                                <View style={styles.dimRecommendation}>
                                    <Text style={styles.dimTitle}>Rekomendasi Dimensi Sizing ({mat.name})</Text>
                                    <View style={styles.dimGrid}>
                                        <View style={styles.dimItem}>
                                            <MaterialIcons name="height" size={16} color="#3b82f6" />
                                            <View>
                                                <Text style={styles.dimLabel}>Tinggi Balok</Text>
                                                <Text style={styles.dimValue}>{matBeamHeightMin.toFixed(0)}-{matBeamHeightMax.toFixed(0)} cm</Text>
                                            </View>
                                        </View>
                                        <View style={styles.dimItem}>
                                            <MaterialIcons name="grid-view" size={16} color="#10b981" />
                                            <View>
                                                <Text style={styles.dimLabel}>Luas Kolom</Text>
                                                <Text style={styles.dimValue} numberOfLines={2}>
                                                    {(matColumnArea / 10000).toFixed(2)} m²{"\n"}({(matColumnDim / 100).toFixed(2)}x{(matColumnDim / 100).toFixed(2)} m)
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            );
                        })()}
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
    descSection: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, marginBottom: 16 },
    descLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: 4 },
    descText: { fontSize: 14, color: "#1e2937", lineHeight: 20 },
    divider: { height: 1, backgroundColor: "#f3f4f6", marginBottom: 16 },

    sectionHeader: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#374151" },
    materialSection: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: "#e6e9ee",
        marginBottom: 20,
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

    dimRecommendation: {
        marginTop: 20,
        backgroundColor: "#f0f9ff",
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: "#bae6fd",
    },
    dimTitle: { fontSize: 13, fontWeight: "700", color: "#0369a1", marginBottom: 10 },
    dimGrid: { flexDirection: "row", gap: 12 },
    dimItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    dimLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase" },
    dimValue: { fontSize: 15, fontWeight: "700", color: "#0f172a" },

});
