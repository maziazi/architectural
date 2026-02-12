
import { supabase } from "@/lib/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RecentProject {
  id: string;
  name: string;
  building_type: string;
  main_span: number;
  created_at: string;
  materials: {
    name: string;
  } | null;
}

export default function HomePage() {
  const router = useRouter();
  const bottomExtra = Platform.OS === "ios" ? 34 : 16;
  const [projectName, setProjectName] = useState("");
  const [mainSpan, setMainSpan] = useState<number>(3);
  const [colSpacing, setColSpacing] = useState<number>(3);
  const [selectedFunction, setSelectedFunction] = useState("Hunian");

  const [recentProject, setRecentProject] = useState<RecentProject | null>(null);

  const functions = ["Hunian", "Kantor", "Sekolah", "Publik"];

  useFocusEffect(
    useCallback(() => {
      fetchRecentProject();
    }, [])
  );

  const fetchRecentProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, materials(name)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error("Error fetching recent project:", error);
      } else if (data) {
        setRecentProject(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [colSpacingStr, setColSpacingStr] = useState("3.00");
  const [mainSpanStr, setMainSpanStr] = useState("3.00");

  const handleColTextChange = (text: string) => {
    setColSpacingStr(text);
    const val = parseFloat(text);
    if (!isNaN(val)) {
      setColSpacing(val);
    }
  };

  const handleSpanTextChange = (text: string) => {
    setMainSpanStr(text);
    const val = parseFloat(text);
    if (!isNaN(val)) {
      setMainSpan(val);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: styles.content.paddingBottom + bottomExtra },
        ]}
      >
        <View style={styles.statusSpacer} />

        <View style={styles.header}>
          <Text style={styles.title}>Sistem Balok</Text>
          <Text style={styles.subtitle}>
            Menentukan jenis, dimensi awal, dan material balok yang efisien
            sesuai bentang dan grid struktur.
          </Text>
        </View>

        <View style={styles.fieldCard}>
          <View style={styles.fieldCard}>
            <Text style={styles.label}>Nama Proyek</Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Contoh: Villa Canggu Tahap 1"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
          </View>

          <View style={styles.segmentWrap}>
            <Text style={styles.labelSmall}>Fungsi Bangunan</Text>
            <View style={styles.segmentedControl}>
              {functions.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setSelectedFunction(f)}
                  style={[
                    styles.segmentItem,
                    selectedFunction === f
                      ? styles.segmentItemActive
                      : styles.segmentItemInactive,
                  ]}
                >
                  <Text
                    style={
                      selectedFunction === f
                        ? styles.segmentTextActive
                        : styles.segmentTextInactive
                    }
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dimRow}>
            <View style={[styles.dimCard, { marginRight: 0 }]}>
              <View style={styles.dimHeader}>
                <Text style={styles.dimLabel}>Jarak Kolom (m)</Text>
              </View>
              <TextInput
                style={styles.dimInput}
                value={colSpacingStr}
                onChangeText={handleColTextChange}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </View>

          <View>
            <View style={[styles.dimCard, { marginLeft: 0, marginTop: 8 }]}>
              <View style={styles.dimHeader}>
                <Text style={styles.dimLabel}>Bentang Utama (m)</Text>
              </View>
              <TextInput
                style={styles.dimInput}
                value={mainSpanStr}
                onChangeText={handleSpanTextChange}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => {
              if (!projectName.trim()) {
                Alert.alert("Data Belum Lengkap", "Silakan isi Nama Proyek terlebih dahulu.");
                return;
              }

              const spanVal = parseFloat(mainSpanStr);
              const colVal = parseFloat(colSpacingStr);

              if (!mainSpanStr || isNaN(spanVal) || spanVal <= 0) {
                Alert.alert("Data Invalid", "Silakan isi Bentang Utama dengan angka yang valid.");
                return;
              }

              if (!colSpacingStr || isNaN(colVal) || colVal <= 0) {
                Alert.alert("Data Invalid", "Silakan isi Jarak Kolom dengan angka yang valid.");
                return;
              }

              if (!selectedFunction) {
                Alert.alert("Data Belum Lengkap", "Silakan pilih Fungsi Bangunan.");
                return;
              }

              router.push({
                pathname: "/project/result",
                params: {
                  projectName,
                  buildingType: selectedFunction,
                  mainSpan: spanVal.toString(),
                  columnDistance: colVal.toString(),
                },
              });
            }}
          >
            <Text style={styles.primaryButtonText}>
              Analisis Sistem Struktur
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.recentsWrap, { marginTop: 8 }]}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Terakhir Dikerjakan</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.viewAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {recentProject ? (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({
                pathname: "/project/[id]",
                params: { id: recentProject.id, from: "Home" }
              })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    {recentProject.name}
                  </Text>
                  <Text style={styles.cardSubtitle}>{recentProject.building_type}</Text>
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
                    <Text style={styles.gridValue}>{recentProject.main_span.toFixed(2)} m</Text>
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
                    <Text style={styles.gridValue}>{recentProject.materials?.name || "N/A"}</Text>
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
                  <Text style={styles.footerDate}>{new Date(recentProject.created_at).toLocaleString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#94a3b8", fontStyle: "italic", marginTop: 8 }}>
              Belum ada proyek yang dikerjakan.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f8" },
  content: { padding: 20, paddingBottom: 120 },
  statusSpacer: { height: 12 },
  header: { paddingHorizontal: 0, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#64748b", marginTop: 4 },

  fieldCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: { fontSize: 18, paddingVertical: 4, color: "#0f172a" },

  segmentWrap: { marginTop: 12 },
  labelSmall: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.04)",
    padding: 4,
    borderRadius: 10,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentItemActive: { backgroundColor: "#fff" },
  segmentItemInactive: { backgroundColor: "transparent" },
  segmentTextActive: { color: "#135bec", fontWeight: "600" },
  segmentTextInactive: { color: "#94a3b8" },

  dimRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  dimColumn: { flexDirection: "column", gap: 12, marginTop: 12 },
  dimCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
  },
  dimLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dimInputRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 6 },
  dimInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    padding: 0,
    color: "#0f172a",
  },
  dimUnit: { color: "#94a3b8", marginLeft: 6, marginBottom: 2 },
  dimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dimValueRight: { fontSize: 16, fontWeight: "700", color: "#0f172a" },

  primaryButton: {
    marginTop: 16,
    backgroundColor: "#135bec",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", marginRight: 8 },

  recentsWrap: { paddingTop: 16, paddingBottom: 20 },
  recentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentsTitle: { fontSize: 16, fontWeight: "700" },
  viewAll: { color: "#135bec", fontWeight: "600" },

  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
    marginBottom: 8,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(19,91,236,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: { fontWeight: "700", fontSize: 14 },
  recentMeta: { fontSize: 12, color: "#64748b", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e6e9ee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
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
