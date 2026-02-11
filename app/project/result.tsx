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
    span_range: string;
    depth: string;
    description: string;
}

export default function ProjectResultPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const { projectName, buildingType, mainSpan, columnDistance } = params;

    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [saving, setSaving] = useState(false);

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

            // Simple parsing logic: extract numbers from "6m - 12m" string
            // If mainSpan is within range, include it.
            const span = Number(mainSpan);

            const recommended = data.filter((m) => {
                // Regex to find numbers. range typically "min - max"
                const matches = m.span_range.match(/(\d+(\.\d+)?)/g);
                if (!matches || matches.length < 1) return true; // Keep if uncertain

                const min = parseFloat(matches[0]);
                const max = matches.length > 1 ? parseFloat(matches[1]) : 999; // Assume open ended if one number? or just max? usually it's "up to X".

                // If it says "up to 12m", match might be just [12].
                // If "6m - 12m", matches [6, 12].
                // If "15m+", matches [15].

                // Heuristic:
                if (m.span_range.includes("-")) {
                    return span >= min && span <= max;
                } else if (m.span_range.includes("+")) {
                    return span >= min;
                } else {
                    // "Up to X" or just "X"
                    return span <= min;
                }
            });

            // Sort by how close the span is to the middle of the range? 
            // For now just set them.
            setMaterials(recommended.length > 0 ? recommended : data); // Fallback to all if none match? Or show empty? User wants recommendations.
            // Let's show filtered. If empty, the UI shows empty message.
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

            <View style={styles.specRow}>
                <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Rentang</Text>
                    <Text style={styles.specValue}>{item.span_range}</Text>
                </View>
                <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Kedalaman</Text>
                    <Text style={styles.specValue}>{item.depth}</Text>
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
                    Untuk {buildingType} dengan bentang {Number(mainSpan).toFixed(4)}m
                </Text>
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
});
