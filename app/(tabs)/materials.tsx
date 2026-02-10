import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MaterialsPage() {
  const bottomExtra = Platform.OS === "ios" ? 34 : 16;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: styles.content.paddingBottom + bottomExtra },
        ]}
      >
        <Text style={styles.title}>Material</Text>
        <Text style={styles.subtitle}>
          Pahami karakteristik material dan aplikasi tipikalnya.
        </Text>

        <View style={styles.cardRow}>
          <Image
            source={require("@/assets/images/materials/concrete.jpg")}
            style={styles.thumb}
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Beton</Text>
              <MaterialIcons name="chevron-right" size={20} color="#135bec" />
            </View>
            <Text style={styles.cardText}>
              Beton bertulang kuat terhadap beban tekan cocok untuk kolom dan
              pelat pada bangunan bertingkat.
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Image
            source={require("@/assets/images/materials/steel.jpg")}
            style={styles.thumb}
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Baja</Text>
              <MaterialIcons name="chevron-right" size={20} color="#135bec" />
            </View>
            <Text style={styles.cardText}>
              Baja memberikan rasio kekuatan-berat tinggi ideal untuk bentang
              panjang dan struktur prefabrikasi.
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Image
            source={require("@/assets/images/materials/timber.jpeg")}
            style={styles.thumb}
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Kayu</Text>
              <MaterialIcons name="chevron-right" size={20} color="#135bec" />
            </View>
            <Text style={styles.cardText}>
              Kayu ringan dan estetis cocok untuk struktur modular ringan dan
              ruang dengan fokus estetika.
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Image
            source={require("@/assets/images/materials/masonry.jpeg")}
            style={styles.thumb}
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pasangan Bata</Text>
              <MaterialIcons name="chevron-right" size={20} color="#135bec" />
            </View>
            <Text style={styles.cardText}>
              Pasangan bata tekstural dan ekonomis ideal untuk penggunaan
              struktural, perhatikan ketebalan dan sambungan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "#6b7280", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: { marginTop: 6, color: "#374151" },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e9ee",
  },
  thumb: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f1f5f9",
  },
  cardBody: { flex: 1 },
});
