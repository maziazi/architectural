import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProjectItem {
  id: string;
  name: string;
  building_type: string;
  main_span: number;
  created_at: string;
  materials: {
    name: string;
  } | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const bottomExtra = Platform.OS === "ios" ? 34 : 16;

  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          materials (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((it) =>
      (it.name + " " + it.building_type + " " + (it.materials?.name || ""))
        .toLowerCase()
        .includes(q),
    );
  }, [projects, query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: styles.content.paddingBottom + bottomExtra },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Riwayat</Text>

        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={18}
            color="#94a3b8"
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari proyek, tipe, atau material..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={16} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#135bec" style={{ marginTop: 20 }} />
        ) : (
          filteredItems.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.card}
              onPress={() => router.push({
                pathname: "/project/[id]",
                params: { id: it.id, from: "Riwayat" }
              })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{it.name}</Text>
                  <Text style={styles.cardSubtitle}>{it.building_type}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#135bec" />
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <View style={styles.iconBox}>
                    <MaterialIcons name="straighten" size={18} color="#135bec" />
                  </View>
                  <View style={styles.gridText}>
                    <Text style={styles.gridLabel}>Bentang</Text>
                    <Text style={styles.gridValue}>{it.main_span.toFixed(2)} m</Text>
                  </View>
                </View>

                <View style={styles.gridItem}>
                  <View style={styles.iconBox}>
                    <MaterialIcons
                      name="architecture"
                      size={18}
                      color="#135bec"
                    />
                  </View>
                  <View style={styles.gridText}>
                    <Text style={styles.gridLabel}>Struktur</Text>
                    <Text style={styles.gridValue}>{it.materials?.name || "N/A"}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <MaterialIcons
                    name="calendar-today"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text style={styles.footerDate}>
                    {new Date(it.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {!loading && projects.length === 0 && (
          <Text style={{ textAlign: "center", color: "#94a3b8", marginTop: 20 }}>
            Belum ada proyek tersimpan.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, padding: 0, color: "#0f172a" },
  clearButton: { marginLeft: 8, padding: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  grid: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  gridItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e6f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  gridText: { marginLeft: 8, flex: 1 },
  gridLabel: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  gridValue: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 8,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerDate: { marginLeft: 8, color: "#94a3b8", fontSize: 12 },
});
