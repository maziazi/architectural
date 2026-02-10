import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
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

export default function HistoryPage() {
  const bottomExtra = Platform.OS === "ios" ? 34 : 16;
  const [query, setQuery] = useState("");

  const items = [
    {
      title: "Apartemen Setiabudi",
      buildingType: "Residential",
      span: "8.5 m",
      material: "Beton Bertulang",
      created: "2023-10-12T14:20:00",
    },
    {
      title: "Paviliun Canggu",
      buildingType: "Hospitality",
      span: "12.0 m",
      material: "Rangka Baja",
      created: "2023-10-05T09:15:00",
    },
    {
      title: "Gudang Logistik Bekasi",
      buildingType: "Industrial",
      span: "24.0 m",
      material: "Space Frame",
      created: "2023-09-28T16:45:00",
    },
  ];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      (it.title + " " + it.buildingType + " " + it.material)
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: styles.content.paddingBottom + bottomExtra },
        ]}
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

        {filteredItems.map((it, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{it.title}</Text>
                <Text style={styles.cardSubtitle}>{it.buildingType}</Text>
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
                  <Text style={styles.gridValue}>{it.span}</Text>
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
                  <Text style={styles.gridValue}>{it.material}</Text>
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
                  {new Date(it.created).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
  cardMeta: { fontSize: 12, color: "#6b7280" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  badge: {
    backgroundColor: "#e6f0ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#135bec",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },
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
