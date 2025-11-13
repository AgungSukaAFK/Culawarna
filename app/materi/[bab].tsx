// Nama file: app/materi/[bab].tsx
// (KODE LENGKAP UNTUK SOLUSI EXPO GO / SHARING)

import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing"; // <-- Hanya gunakan ini
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // <-- Impor yang benar

// Path relatif (Sudah benar)
const pdfAssets = {
  bab1: require("../../assets/pdf/bab 1 - kelompok sosial.pdf"),
  bab2: require("../../assets/pdf/bab 2 - permasalahan sosial.pdf"),
  bab3: require("../../assets/pdf/bab 3 - konflik sosial.pdf"),
  bab4: require("../../assets/pdf/bab 4 - membangun harmoni sosial.pdf"),
};

// Mapping judul
const materiMap: { [key: string]: { title: string } } = {
  bab1: { title: "BAB 1: Kelompok Sosial" },
  bab2: { title: "BAB 2: Permasalahan Sosial" },
  bab3: { title: "BAB 3: Konflik Sosial" },
  bab4: { title: "BAB 4: Harmoni Sosial" },
};

export default function MateriScreen() {
  const router = useRouter();
  const { bab } = useLocalSearchParams<{ bab: string }>();
  const [isLoading, setIsLoading] = useState(false); // Hanya untuk tombol

  const materi = bab ? materiMap[bab] : null;
  const babKey = bab as keyof typeof pdfAssets;

  const handleOpenPdf = async () => {
    if (isLoading || !materi || !babKey || !(babKey in pdfAssets)) return;

    setIsLoading(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Error",
          "Fitur 'sharing' tidak tersedia di perangkat ini."
        );
        setIsLoading(false);
        return;
      }

      const pdfModule = pdfAssets[babKey];
      const asset = Asset.fromModule(pdfModule);
      if (!asset.downloaded) {
        await asset.downloadAsync();
      }

      if (asset.localUri) {
        // Buka dialog "Buka dengan..."
        await Sharing.shareAsync(asset.localUri, {
          mimeType: "application/pdf",
          dialogTitle: materi.title,
        });
      } else {
        throw new Error("Gagal mendapatkan URI lokal dari aset PDF.");
      }
    } catch (error: any) {
      console.error("Error membuka PDF:", error);
      Alert.alert("Error", `Gagal memuat PDF: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#4A2A00" />
        </TouchableOpacity>
        <Text style={styles.title}>{materi?.title || "Materi"}</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.contentArea}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="document-text-outline" size={100} color="#CCC" />
          <Text style={styles.placeholderText}>
            Materi akan dibuka menggunakan aplikasi PDF viewer di perangkat
            Anda.
          </Text>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleOpenPdf}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Buka Materi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFB347",
    borderBottomWidth: 5,
    borderColor: "#4A2A00",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    textAlign: "center",
    flex: 1,
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderBottomWidth: 4,
    borderColor: "#4B0082",
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#AAA",
    borderColor: "#777",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
