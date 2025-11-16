// Di dalam file: app/pantai.tsx
// (KODE LENGKAP DENGAN PENGECEKAN ENERGI)

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, // <-- 1. Impor Alert
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Impor Tipe, Layout, dan Konteks
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext"; // <-- 2. Impor GameContext

// --- KOMPONEN MODAL PEMILIHAN MINIGAME (Tidak berubah) ---
interface ModalMinigameSelectProps {
  visible: boolean;
  onClose: () => void;
  onSelectMemoryGame: () => void;
  onSelectFoodDrop: () => void;
}

const ModalMinigameSelect: React.FC<ModalMinigameSelectProps> = ({
  visible,
  onClose,
  onSelectMemoryGame,
  onSelectFoodDrop,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={10}
        tint={Platform.OS === "web" ? "light" : "dark"}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pilih Minigame</Text>
          <ScrollView contentContainerStyle={styles.selectionGrid}>
            {/* Tombol Memory Food */}
            <TouchableOpacity
              style={styles.gameSelectionButton}
              onPress={onSelectMemoryGame}
            >
              <Ionicons name="apps" size={40} color="#4A2A00" />
              <Text style={styles.gameSelectionText}>Memory Food</Text>
              <Text style={styles.gameSelectionDesc}>
                Cocokkan gambar makanan!
              </Text>
            </TouchableOpacity>

            {/* Tombol Food Drop (Sekarang Aktif) */}
            <TouchableOpacity
              style={styles.gameSelectionButton}
              onPress={onSelectFoodDrop}
            >
              <Ionicons name="rainy" size={40} color="#4A2A00" />
              <Text style={styles.gameSelectionText}>Food Drop</Text>
              <Text style={styles.gameSelectionDesc}>
                Tangkap makanan, hindari bom!
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.modalButton,
              styles.kembaliButton,
              { alignSelf: "center", marginTop: 20 },
            ]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.modalButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- LAYAR PANTAI (UTAMA) ---
export default function PantaiScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameContext(); // <-- 3. Dapatkan state & dispatch
  const [isSelectModalVisible, setSelectModalVisible] = useState(false);

  const MINIGAME_ENERGY_COST = 15; // <-- 4. Tentukan biaya energi

  // --- 5. Buat fungsi handler untuk Memory Game ---
  const handleSelectMemoryGame = () => {
    if (state.energi < MINIGAME_ENERGY_COST) {
      Alert.alert(
        "Si Cula Lelah!",
        "Energi tidak cukup untuk bermain. Isi energi dulu di Dapur."
      );
      return;
    }
    // Kurangi energi, tutup modal, lalu main
    dispatch({ type: "GUNAKAN_ENERGI", payload: MINIGAME_ENERGY_COST });
    setSelectModalVisible(false);
    router.push("/minigame/memory-food");
  };

  // --- 6. Buat fungsi handler untuk Food Drop ---
  const handleSelectFoodDrop = () => {
    if (state.energi < MINIGAME_ENERGY_COST) {
      Alert.alert(
        "Si Cula Lelah!",
        "Energi tidak cukup untuk bermain. Isi energi dulu di Dapur."
      );
      return;
    }
    // Kurangi energi, tutup modal, lalu main
    dispatch({ type: "GUNAKAN_ENERGI", payload: MINIGAME_ENERGY_COST });
    setSelectModalVisible(false);
    router.push("/minigame/food-drop");
  };

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/homescreen_bg.png")}
      onPressNavLeft={() => router.replace("/ruangTamu")}
      onPressNavRight={() => router.replace("/kamar")}
      middleNavButton={{
        onPress: () => setSelectModalVisible(true),
        icon: <Ionicons name="game-controller" size={24} color="white" />,
        text: "Main Game",
      }}
      pageModal={
        // --- 7. Gunakan handler baru di modal ---
        <ModalMinigameSelect
          visible={isSelectModalVisible}
          onClose={() => setSelectModalVisible(false)}
          onSelectMemoryGame={handleSelectMemoryGame}
          onSelectFoodDrop={handleSelectFoodDrop}
        />
      }
    >
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <Image
          source={require("@/assets/images/cula_character.png")}
          style={styles.karakter}
        />
      </View>
    </GameHUDLayout>
  );
}

// --- STYLESHEET (Tidak berubah) ---
const styles = StyleSheet.create({
  kontenArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 90,
  },
  karakter: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  // --- Style Modal ---
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 340,
    maxHeight: "85%",
    backgroundColor: "#FFB347",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#4A2A00",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 20,
    alignSelf: "center",
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    cursor: "pointer",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  kembaliButton: {
    backgroundColor: "#8A2BE2",
    borderColor: "#4B0082",
  },
  // --- Style Modal Game Selection ---
  selectionGrid: {
    width: "100%",
    alignItems: "center",
  },
  gameSelectionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#4A2A00",
    alignItems: "center",
    width: "90%",
    margin: 10,
    cursor: "pointer",
  },
  gameSelectionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2A00",
    marginTop: 10,
  },
  gameSelectionDesc: {
    fontSize: 14,
    color: "#4A2A00",
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: "#AAA",
    borderColor: "#777",
    opacity: 0.7,
  },
  disabledText: {
    color: "#555",
  },
});
