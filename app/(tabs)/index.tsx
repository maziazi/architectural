import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomePage() {
  const router = useRouter();
  const bottomExtra = Platform.OS === "ios" ? 34 : 16;
  const [projectName, setProjectName] = useState("");
  const [mainSpan, setMainSpan] = useState<number>(3);
  const [colSpacing, setColSpacing] = useState<number>(3);
  const [selectedFunction, setSelectedFunction] = useState("Hunian");

  const functions = ["Hunian", "Kantor", "Sekolah", "Publik"];

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
                <Text style={styles.dimLabel}>Jarak Kolom</Text>
                <Text style={styles.dimValueRight}>
                  {colSpacing.toFixed(1)} m
                </Text>
              </View>
              <Slider
                minimumValue={3}
                maximumValue={15}
                step={0.1}
                value={colSpacing}
                onValueChange={setColSpacing}
                minimumTrackTintColor="#135bec"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#135bec"
                style={styles.sliderSmall}
              />
            </View>
          </View>

          <View>
            <View style={[styles.dimCard, { marginLeft: 0, marginTop: 8 }]}>
              <View style={styles.dimHeader}>
                <Text style={styles.dimLabel}>Bentang Utama</Text>
                <Text style={styles.dimValueRight}>
                  {mainSpan.toFixed(1)} m
                </Text>
              </View>
              <Slider
                minimumValue={3}
                maximumValue={30}
                step={0.1}
                value={mainSpan}
                onValueChange={setMainSpan}
                minimumTrackTintColor="#135bec"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#135bec"
                style={styles.sliderSmall}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
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

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  Gedung Perkantoran Sudirman
                </Text>
                <Text style={styles.cardSubtitle}>Perkantoran</Text>
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
                  <Text style={styles.gridValue}>9.0 m</Text>
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
                  <Text style={styles.gridValue}>Beton Bertulang</Text>
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
                <Text style={styles.footerDate}>2023-10-12 14:20</Text>
              </View>
            </View>
          </View>
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
  slider: { width: "100%", height: 24 },
  sliderSmall: { width: "100%", height: 12, marginVertical: 12 },
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
