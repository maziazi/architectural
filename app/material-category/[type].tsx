import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface MaterialItem {
    id: string;
    name: string;
    type: string;
    span_range: string;
    depth: string;
}

export default function MaterialCategoryPage() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: string }>();

    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (type) fetchMaterialsByType();
    }, [type]);

    const fetchMaterialsByType = async () => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('type', type);

            if (error) {
                console.error("Error fetching materials by type:", error);
            } else {
                setMaterials(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: MaterialItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                router.push({
                    pathname: "/material-detail/[id]",
                    params: { id: item.id },
                })
            }
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.type}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#135bec" />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Rentang Bentang</Text>
                    <Text style={styles.value}>{item.span_range}</Text>
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Kedalaman</Text>
                    <Text style={styles.value}>{item.depth}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: type || "Material List",
                    headerBackTitle: "Material",
                }}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#135bec" />
                </View>
            ) : (
                <FlatList
                    data={materials}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.content}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Tidak ada material ditemukan untuk kategori ini.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7f8" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e6e9ee",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    cardSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
    divider: { height: 1, backgroundColor: "#f3f4f6", marginBottom: 12 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    col: { flex: 1 },
    label: { fontSize: 12, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    value: { fontSize: 15, fontWeight: "600", color: "#374151" },
    emptyContainer: { padding: 40, alignItems: "center" },
    emptyText: { color: "#6b7280", fontSize: 16, textAlign: "center" },
});
