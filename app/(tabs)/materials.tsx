import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { materialCategories } from "@/constants/materialData";

export default function MaterialsPage() {
  const router = useRouter();
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

        {materialCategories.map((material) => (
          <TouchableOpacity
            key={material.id}
            style={styles.cardRow}
            onPress={() =>
              router.push({
                pathname: "/material-category/[type]",
                params: { type: material.name },
              })
            }
          >
            <Image source={material.image} style={styles.thumb} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{material.name}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#135bec" />
              </View>
              <Text style={styles.cardText}>{material.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "#6b7280", marginBottom: 12 },
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
    // Shadow for better visual depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
