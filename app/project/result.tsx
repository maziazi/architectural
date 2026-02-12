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

    const { projectName, buildingType, mainSpan, columnDistance, buildingDescription } = params;

    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [saving, setSaving] = useState(false);
    const [expandedLogic, setExpandedLogic] = useState(false);

    // Structural Logic Calculations
    const span = Number(mainSpan);
    const spacing = Number(columnDistance);
    const functionType = String(buildingType);

    // Horizontal Calculation
    let beamHeightMin = 0;
    let beamHeightMax = 0;
    if (functionType === "Hunian") {
        beamHeightMin = span / 24 * 100;
        beamHeightMax = span / 22 * 100;
    } else if (functionType === "Kantor") {
        beamHeightMin = span / 20 * 100;
        beamHeightMax = span / 18 * 100;
    } else if (functionType === "Sekolah" || functionType === "Publik") {
        beamHeightMin = span / 18 * 100;
        beamHeightMax = span / 14 * 100;
    } else {
        beamHeightMin = span / 20 * 100;
        beamHeightMax = span / 16 * 100;
    }

    // Vertical Calculation
    const tributaryArea = span * spacing;
    let loadFactor = 1.0;
    if (functionType === "Hunian") loadFactor = 1.0;
    else if (functionType === "Kantor") loadFactor = 1.3;
    else if (functionType === "Sekolah" || functionType === "Publik") loadFactor = 1.6;

    // Simplified Column Area Rule: Approx 0.1% of tributary load in kg? 
    // Let's use a scale: Area (cm2) = TributaryArea (m2) * factor * 12 (heuristic for preliminary)
    const columnArea = tributaryArea * loadFactor * 15;
    const columnDim = Math.sqrt(columnArea);

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
            const { data, error } = await supabase
                .from('projects')
                .insert([
                    {
                        name: projectName,
                        building_type: buildingType,
                        main_span: Number(mainSpan),
                        column_distance: Number(columnDistance),
                        selected_material_id: materialId,
                        description: buildingDescription,
                    }
                ])
                .select();

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

    const renderItem = ({ item }: { item: Material }) => (
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
                <Text style={styles.dimTitle}>Rekomendasi Dimensi Sizing</Text>
                <View style={styles.dimGrid}>
                    <View style={styles.dimItem}>
                        <MaterialIcons name="height" size={16} color="#3b82f6" />
                        <View>
                            <Text style={styles.dimLabel}>Tinggi Balok</Text>
                            <Text style={styles.dimValue}>{beamHeightMin.toFixed(0)}-{beamHeightMax.toFixed(0)} cm</Text>
                        </View>
                    </View>
                    <View style={styles.dimItem}>
                        <MaterialIcons name="grid-view" size={16} color="#10b981" />
                        <View>
                            <Text style={styles.dimLabel}>Luas Kolom</Text>
                            <Text style={styles.dimValue}>{columnArea.toFixed(0)} cm² ({columnDim.toFixed(0)}x{columnDim.toFixed(0)})</Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.logicToggle}
                onPress={() => setExpandedLogic(!expandedLogic)}
            >
                <Text style={styles.logicToggleText}>Lihat Justifikasi Struktur</Text>
                <MaterialIcons name={expandedLogic ? "expand-less" : "expand-more"} size={20} color="#64748b" />
            </TouchableOpacity>

            {expandedLogic && (
                <View style={styles.logicContent}>
                    <Text style={styles.logicText}>
                        • Bangunan <Text style={{ fontWeight: '700' }}>{functionType}</Text> membutuhkan {functionType === "Hunian" ? "kedalaman struktur standar" : "kedalaman struktur lebih besar"} karena beban hidup yang {(functionType === "Hunian") ? "lebih ringan" : "lebih tinggi"}.
                    </Text>
                    <Text style={styles.logicText}>
                        • Bentang {span.toFixed(2)}m dan jarak kolom {spacing.toFixed(2)}m menentukan beban total yang harus dipikul oleh elemen struktur.
                    </Text>
                    <Text style={styles.logicNote}>
                        *Ini hanya estimasi awal (preliminary sizing). Verifikasi oleh Structural Engineer tetap diperlukan.
                    </Text>
                </View>
            )}

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
                <Text style={styles.summaryText}>
                    Untuk {buildingType} dengan bentang {Number(mainSpan).toFixed(2)}m
                </Text>
                {buildingDescription && (
                    <Text style={styles.summaryDesc}>
                        Detail: {buildingDescription}
                    </Text>
                )}
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
        padding: 12,
        backgroundColor: "#eff6ff",
        borderBottomWidth: 1,
        borderBottomColor: "#dbeafe",
    },
    summaryText: { textAlign: "center", color: "#1e40af", fontWeight: "600" },
    summaryDesc: { textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 4, fontStyle: "italic" },

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
    dimLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase" },
    dimValue: { fontSize: 14, fontWeight: "700", color: "#0f172a" },

    logicToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        marginBottom: 4,
    },
    logicToggleText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
    logicContent: {
        backgroundColor: "#f8fafc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    logicText: { fontSize: 12, color: "#475569", lineHeight: 18, marginBottom: 4 },
    logicNote: { fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 4 },
});
