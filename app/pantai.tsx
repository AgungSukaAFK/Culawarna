// Di dalam file: app/pantai.tsx

import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { HelpContent } from "@/app/types/gameTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// --- SCREEN PANTAI ---
export default function PantaiScreen() {
  const router = useRouter();

  // --- KONTEN BANTUAN (Dipindah ke dalam komponen) ---
  const pantaiHelpContent: HelpContent = {
    title: "Pantai & Minigames 🏖️",
    body: (
      <View>
        <Text style={styles.helpText}>
          Butuh Koin? Datanglah ke Pantai! Di sini tersedia berbagai minigame
          seru untuk mengumpulkan koin.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Daftar Minigame:</Text>
        </Text>

        <View style={styles.bulletPoint}>
          <Ionicons
            name="basket"
            size={16}
            color="#4A2A00"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Food Drop:</Text> Tangkap makanan yang
            jatuh dan hindari bom! Semakin banyak makanan ditangkap, semakin
            banyak koin didapat.
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Ionicons
            name="grid"
            size={16}
            color="#4A2A00"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Memory Food:</Text> Latih ingatanmu!
            Temukan pasangan kartu makanan yang sama sebelum waktu habis.
          </Text>
        </View>

        <Text style={[styles.helpText, { marginTop: 10, fontStyle: "italic" }]}>
          Koin yang didapat bisa digunakan untuk membeli baju, topi, atau
          dekorasi di Toko Budaya.
        </Text>
      </View>
    ),
  };

  return (
    <GameHUDLayout
      // Gunakan video background (pastikan file ada)
      backgroundVideo={require("@/assets/bgvideo/pantai.mp4")}
      // Masukkan konten help yang sudah didefinisikan di atas
      helpContent={pantaiHelpContent}
      onPressNavLeft={() => router.replace("/")}
      onPressNavRight={() => router.replace("/")}
      middleNavButton={{
        onPress: () => Alert.alert("Info", "Pilih Minigame di layar!"),
        icon: <Ionicons name="game-controller" size={24} color="white" />,
        text: "Main",
      }}
      pageModal={null}
    >
      <View style={styles.container}>
        {/* Karakter di Pasir */}
        <View style={styles.characterContainer}>
          <CulaCharacter style={styles.character} />
        </View>

        {/* Menu Minigame */}
        <View style={styles.minigameMenu}>
          <Text style={styles.menuTitle}>Pilih Permainan</Text>

          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => router.push("/minigame/food-drop")}
          >
            <View style={styles.iconBox}>
              <Ionicons name="basket" size={40} color="#FFF" />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Food Drop</Text>
              <Text style={styles.gameDesc}>Tangkap makanan, hindari bom!</Text>
            </View>
            <Ionicons name="play-circle" size={32} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gameButton,
              { backgroundColor: "#2ECC71", borderColor: "#27AE60" },
            ]}
            onPress={() => router.push("/minigame/memory-food")}
          >
            <View style={[styles.iconBox, { backgroundColor: "#27AE60" }]}>
              <Ionicons name="grid" size={40} color="#FFF" />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Memory Food</Text>
              <Text style={styles.gameDesc}>Cocokkan kartu makanan.</Text>
            </View>
            <Ionicons name="play-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  characterContainer: {
    position: "absolute",
    bottom: 100, // Di atas navbar
    right: -20, // Agak ke kanan
    zIndex: 1,
  },
  character: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  minigameMenu: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 20,
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#4A2A00",
    elevation: 5,
    marginTop: -50, // Angkat sedikit ke atas
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  gameButton: {
    flexDirection: "row",
    backgroundColor: "#3498DB",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    borderWidth: 3,
    borderColor: "#2980B9",
    elevation: 3,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: "#2980B9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  gameDesc: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  // --- Styles Help Text ---
  helpText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
    color: "#4A2A00",
  },
  bulletPoint: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "flex-start",
    paddingRight: 10,
  },
  bulletText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    lineHeight: 22,
    flex: 1,
  },
});
