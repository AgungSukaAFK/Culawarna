// Di dalam file: app/pantai.tsx

import { useSFX } from "@/app/_layout"; // <-- Import useSFX
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { HelpContent } from "@/app/types/gameTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- SCREEN PANTAI ---
export default function PantaiScreen() {
  const router = useRouter();
  const { playSfx } = useSFX(); 
  
  const isWeb = Platform.OS === "web";

  // --- KONTEN BANTUAN (Dipindahkan ke dalam komponen) ---
  const pantaiHelpContent: HelpContent = {
    title: "Pantai & Minigames 🏖️",
    body: (
      <View>
        <Text style={styles.helpText}>
          Butuh Koin? Datanglah ke Pantai! Di sini ada 2 permainan seru:
        </Text>
        <View style={styles.bulletPoint}>
          <Ionicons name="basket" size={20} color="#4A2A00" />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Food Drop:</Text> Tangkap makanan yang jatuh, hindari bom!
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="grid" size={20} color="#4A2A00" />
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Memory Food:</Text> Ingat dan cocokkan gambar makanan.
          </Text>
        </View>
      </View>
    ),
  };

  const handleOpenMinigame = (path: string) => {
    playSfx("tap"); // <-- SFX saat pilih game
    router.push(path as any);
  };

  return (
    <GameHUDLayout
      // Logic Background: Gambar di Web, Video di Native
      backgroundImage={isWeb ? require("@/assets/images/homescreen_bg.png") : undefined}
      backgroundVideo={!isWeb ? require("@/assets/bgvideo/pantai.mp4") : undefined}
      
      helpContent={pantaiHelpContent}
      
      onPressNavLeft={() => router.replace("/")}
      onPressNavRight={() => router.replace("/")}
      
      middleNavButton={{
        onPress: () => {}, // Kosong karena menu ada di layar
        icon: <Ionicons name="game-controller" size={24} color="white" />,
        text: "Main",
      }}
      pageModal={null}
    >
      <View style={styles.container}>
        
        {/* Karakter */}
        <View style={styles.characterContainer}>
          <CulaCharacter style={styles.character} />
        </View>

        {/* Menu Minigame */}
        <View style={styles.minigameMenu}>
          <Text style={styles.menuTitle}>Pilih Permainan</Text>
          
          <TouchableOpacity 
            style={styles.gameButton} 
            onPress={() => handleOpenMinigame("/minigame/food-drop")}
          >
            <View style={styles.iconBox}>
              <Ionicons name="basket" size={40} color="#FFF" />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Food Drop</Text>
              <Text style={styles.gameDesc}>Tangkap makanan jatuh!</Text>
            </View>
            <Ionicons name="play-circle" size={32} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gameButton, { backgroundColor: "#2ECC71", borderColor: "#27AE60" }]} 
            onPress={() => handleOpenMinigame("/minigame/memory-food")}
          >
            <View style={[styles.iconBox, { backgroundColor: "#27AE60" }]}>
              <Ionicons name="grid" size={40} color="#FFF" />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Memory Food</Text>
              <Text style={styles.gameDesc}>Uji daya ingatmu!</Text>
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
    bottom: 100,
    right: -20,
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
    marginTop: -50, // Geser ke atas dikit biar gak ketutup nav
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