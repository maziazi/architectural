import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { supabase } from "@/lib/supabase";

interface Material {
    id: string;
    name: string;
    type: string;
    span_min: number;
    span_max: number;
    depth_min: number;
    depth_max: number;
    description: string;
}

export default function ProjectResultPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const { projectName, buildingType, mainSpan, columnDistance, buildingDescription, numFloors, floorHeight } = params;

    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [saving, setSaving] = useState(false);

    // Structural Logic Constants
    const span = Number(mainSpan);
    const spacing = Number(columnDistance);
    const floors = Number(numFloors) || 1;
    const height = Number(floorHeight) || 3.5;
    const functionType = String(buildingType);
    const tributaryArea = span * spacing;

    let loadFactor = 1.0;
    if (functionType === "Hunian") loadFactor = 1.0;
    else if (functionType === "Kantor") loadFactor = 1.3;
    else if (functionType === "Sekolah" || functionType === "Publik") loadFactor = 1.6;

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*');

            if (error) {
                console.error("Error fetching materials:", error);
                Alert.alert("Error", "Gagal mengambil data material.");
                return;
            }

            if (!data) return;

            const recommended = data.filter((m) => {
                const min = m.span_min || 0;
                const max = m.span_max || 999;
                return span >= min && span <= max;
            });

            setMaterials(recommended);

        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMaterial = async (materialId: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('projects')
                .insert([
                    {
                        name: projectName,
                        building_type: buildingType,
                        main_span: Number(mainSpan),
                        column_distance: Number(columnDistance),
                        num_floors: floors,
                        floor_height: height,
                        selected_material_id: materialId,
                        description: buildingDescription,
                    }
                ]);

            if (error) {
                console.error("Error saving project:", error);
                Alert.alert("Error", "Gagal menyimpan proyek.");
            } else {
                Alert.alert("Sukses", "Proyek berhasil disimpan!", [
                    { text: "OK", onPress: () => router.push("/(tabs)/history") }
                ]);
            }
        } catch (err) {
            console.error("Unexpected error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: Material }) => {
        // 1. Material-Specific Beam Height Calculation
        // Memakai rasio unik tiap item dari DB (Efisiensi Teknis)
        // item.depth_min dalam cm, item.span_min dalam m
        const itemEfficiencyRatio = (item.depth_min && item.span_min) ? ((item.depth_min / 100) / item.span_min) : (1 / 20);

        let matBeamHeightMin = span * (itemEfficiencyRatio * 100); // dalam cm
        let matBeamHeightMax = 0;

        const maxRatio = (item.depth_max && item.span_max && item.span_max < 900)
            ? ((item.depth_max / 100) / item.span_max)
            : (item.depth_max && item.span_min) ? ((item.depth_max / 100) / item.span_min) : itemEfficiencyRatio * 1.2;

        matBeamHeightMax = span * (maxRatio * 100); // dalam cm

        // Adjust based on building function (load)
        if (functionType !== "Hunian") {
            const multiplier = functionType === "Kantor" ? 1.15 : 1.25;
            matBeamHeightMin *= multiplier;
            matBeamHeightMax *= multiplier;
        }

        // 2. Advanced Multi-Floor Column Calculation
        let baseTypeFactor = 15; // Default Beton
        let standardRatio = 0.05; // Standar L/20 (0.05)

        if (item.type === "Baja") {
            baseTypeFactor = 4;
            standardRatio = 0.04; // Standar L/25 (0.04)
        } else if (item.type === "Kayu") {
            baseTypeFactor = 22;
            standardRatio = 0.06; // Standar L/16 (0.06)
        } else if (item.type === "Bata") {
            baseTypeFactor = 35;
            standardRatio = 0.1; // L/10
        }

        // Koreksi adjustment: membandingkan rasio m/m vs m/m
        const adjustment = itemEfficiencyRatio / standardRatio;

        // Slenderness Factor (Buckling)
        // Jika tinggi lantai > 3.5m, tambahkan faktor keamanan 5% setiap 0.5m
        let slendernessFactor = 1.0;
        if (height > 3.5) {
            slendernessFactor = 1.0 + ((height - 3.5) / 0.5) * 0.05;
        }

        // TOTAL COLUMN AREA = Area_Dasar * Jumlah_Lantai * Faktor_Langsing
        const matColumnArea = tributaryArea * loadFactor * baseTypeFactor * adjustment * floors * slendernessFactor;
        const matColumnDim = Math.sqrt(matColumnArea); // Sisi kolom dalam cm

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.type}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.description}>{item.description}</Text>

                {/* Preliminary Dimensions */}
                <View style={styles.dimRecommendation}>
                    <Text style={styles.dimTitle}>Rekomendasi Dimensi Sizing ({item.name})</Text>
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



                <View style={styles.specRow}>
                    <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Rentang Material</Text>
                        <Text style={styles.specValue}>
                            {item.span_min && item.span_max
                                ? `${item.span_min}m - ${item.span_max === 999 ? '∞' : item.span_max + 'm'}`
                                : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Kedalaman Standar</Text>
                        <Text style={styles.specValue}>
                            {item.depth_min && item.depth_max
                                ? `${item.depth_min} - ${item.depth_max} cm`
                                : item.depth_min ? `${item.depth_min} cm` : 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => router.push({
                            pathname: "/material-detail/[id]",
                            params: { id: item.id }
                        })}
                    >
                        <Text style={styles.detailButtonText}>Detail Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handleSelectMaterial(item.id)}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Text style={styles.selectButtonText}>Pilih & Simpan</Text>
                                <MaterialIcons name="check" size={18} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: Platform.OS === 'ios',
                    title: "Rekomendasi Struktur",
                    headerBackTitle: "Home"
                }}
            />
            {Platform.OS === 'android' && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Rekomendasi Struktur</Text>
                </View>
            )}

            <View style={styles.summary}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>
                        Untuk {buildingType} — {projectName}
                    </Text>
                </View>

                <View style={styles.summaryDetailGrid}>
                    <View style={styles.summaryDetailItem}>
                        <Text style={styles.summaryDetailLabel}>BENTANG</Text>
                        <Text style={styles.summaryDetailValue}>{Number(mainSpan).toFixed(2)} m</Text>
                    </View>
                    <View style={styles.summaryDetailItem}>
                        <Text style={styles.summaryDetailLabel}>JARAK KOLOM</Text>
                        <Text style={styles.summaryDetailValue}>{Number(columnDistance).toFixed(2)} m</Text>
                    </View>
                    <View style={styles.summaryDetailItem}>
                        <Text style={styles.summaryDetailLabel}>LANTAI</Text>
                        <Text style={styles.summaryDetailValue}>{floors} Lt</Text>
                    </View>
                    <View style={styles.summaryDetailItem}>
                        <Text style={styles.summaryDetailLabel}>TINGGI /LT</Text>
                        <Text style={styles.summaryDetailValue}>{height.toFixed(2)} m</Text>
                    </View>
                </View>


            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#135bec" />
                    <Text style={{ marginTop: 12, color: "#6b7280" }}>Menganalisis...</Text>
                </View>
            ) : (
                <FlatList
                    data={materials}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Tidak ada rekomendasi material ditemukan.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 20, fontWeight: "700", color: "#111827" },

    summary: {
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    summaryHeader: {
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e40af",
        textAlign: "center"
    },
    summaryDetailGrid: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    summaryDetailItem: {
        flex: 1,
        alignItems: "center"
    },
    summaryDetailLabel: {
        fontSize: 10,
        color: "#64748b",
        fontWeight: "700",
        marginBottom: 4
    },
    summaryDetailValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a"
    },
    summaryDescBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9"
    },
    summaryDescLabel: {
        fontSize: 9,
        fontWeight: "800",
        color: "#94a3b8",
        letterSpacing: 0.5,
        marginBottom: 4
    },
    summaryDescText: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 18,
        fontStyle: "italic"
    },

    listContent: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    badge: {
        backgroundColor: "#f1f5f9",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    badgeText: { fontSize: 12, color: "#475569", fontWeight: "600" },

    description: { fontSize: 14, color: "#4b5563", marginBottom: 12, lineHeight: 20 },

    specRow: { flexDirection: "row", marginBottom: 16, backgroundColor: "#f8fafc", padding: 8, borderRadius: 8 },
    specItem: { flex: 1 },
    specLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: "700" },
    specValue: { fontSize: 14, fontWeight: "600", color: "#334155", marginTop: 2 },

    actions: { flexDirection: "row", gap: 12 },
    detailButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center",
    },
    detailButtonText: { color: "#475569", fontWeight: "600" },

    selectButton: {
        flex: 1,
        backgroundColor: "#135bec",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    selectButtonText: { color: "#fff", fontWeight: "700" },

    emptyText: { textAlign: "center", marginTop: 40, color: "#94a3b8" },

    dimRecommendation: {
        backgroundColor: "#f0f9ff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#bae6fd",
    },
    dimTitle: { fontSize: 13, fontWeight: "700", color: "#0369a1", marginBottom: 8 },
    dimGrid: { flexDirection: "row", gap: 16 },
    dimItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    dimLabel: { fontSize: 10, color: "#64748b" },
    dimValue: { fontSize: 13, fontWeight: "700", color: "#0f172a", flexShrink: 1 },


});
