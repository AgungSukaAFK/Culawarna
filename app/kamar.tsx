// Di dalam file: app/kamar.tsx

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSFX } from "@/app/_layout"; // Import Hook Audio
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { HelpContent, ModalLemariProps } from "@/app/types/gameTypes";

// --- MODAL LEMARI ---
const ModalLemari: React.FC<ModalLemariProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();
  const { playSfx, playBtnSound } = useSFX(); 

  const handleGantiBaju = (itemId: string | null) => {
    playSfx("tap"); 

    // Reset Topi (karena fitur topi dihapus)
    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType: "topiId", itemId: null },
    });
    
    // Ganti Baju
    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType: "bajuId", itemId },
    });
  };

  // Helper Nama Cantik
  const getLabel = (id: string) => {
    if (id === "baju-baduy") return "Baduy";
    if (id === "baju-batik") return "Batik";
    if (id === "baju-minang") return "Minang";
    return id;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Koleksi Pakaian</Text>
          <ScrollView style={{ width: "100%" }}>
            
            <View style={styles.lemariGrid}>
              
              {/* Opsi: Lepas */}
              <TouchableOpacity
                style={[
                  styles.itemBaju,
                  state.currentOutfit.bajuId === null && styles.itemSelected,
                ]}
                onPress={() => handleGantiBaju(null)}
              >
                <Ionicons name="body-outline" size={35} color="#4A2A00" />
                <Text style={styles.itemBajuText}>Lepas</Text>
              </TouchableOpacity>

              {/* Opsi: List Baju Milik Player */}
              {state.ownedBaju
                .filter((id) => id !== "baju-dasar") 
                .map((itemId) => (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.itemBaju,
                      state.currentOutfit.bajuId === itemId && styles.itemSelected,
                    ]}
                    onPress={() => handleGantiBaju(itemId)}
                  >
                    <FontAwesome5 name="tshirt" size={35} color="#4A2A00" />
                    <Text style={styles.itemBajuText}>{getLabel(itemId)}</Text>
                  </TouchableOpacity>
                ))}
            </View>

          </ScrollView>

          <TouchableOpacity
            style={[styles.modalButton, styles.kembaliButton]}
            onPress={() => {
              playBtnSound(); 
              onClose();
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.modalButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- SCREEN KAMAR ---
export default function KamarScreen() {
  const router = useRouter();
  const { state } = useGameContext();
  const [isLemariVisible, setLemariVisible] = useState<boolean>(false);

  // --- KONTEN BANTUAN (Dipindah ke dalam komponen agar styles terbaca) ---
  const kamarHelpContent: HelpContent = {
    title: "Lemari Baju 👕",
    body: (
      <View>
        <Text style={styles.helpText}>
          Pilih pakaian adat untuk Si Cula!
        </Text>
        <Text style={styles.helpText}>
          • <Text style={styles.bold}>Baju Baduy:</Text> Pakaian hitam-hitam khas masyarakat Kanekes.
          {"\n"}• <Text style={styles.bold}>Batik Banten:</Text> Kemeja dengan motif khas Banten.
          {"\n"}• <Text style={styles.bold}>Baju Minang:</Text> Pakaian adat Sumatera Barat.
        </Text>
      </View>
    ),
  };

  // Helper label untuk debug info di layar
  const currentBajuLabel = state.currentOutfit.bajuId 
    ? state.currentOutfit.bajuId.replace("baju-", "").toUpperCase() 
    : "DASAR";

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kamar_bg.png")}
      onPressNavLeft={() => router.replace("/dapur")}
      onPressNavRight={() => router.replace("/ruangTamu")}
      helpContent={kamarHelpContent}
      middleNavButton={{
        onPress: () => setLemariVisible(true), // Suara handled by Layout
        icon: (
          <MaterialCommunityIcons name="wardrobe" size={24} color="white" />
        ),
        text: "Lemari",
      }}
      pageModal={
        <ModalLemari
          visible={isLemariVisible}
          onClose={() => setLemariVisible(false)}
        />
      }
    >
      <View style={styles.kontenArea}>
        {/* Debug Info Kecil */}
        <View style={styles.outfitBadge}>
          <Text style={styles.outfitText}>Outfit: {currentBajuLabel}</Text>
        </View>

        <CulaCharacter style={styles.karakterKamar} />
      </View>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  // Styles Help
  helpText: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 5 },
  bold: { fontWeight: "bold", color: "#4A2A00" },
  
  // Styles Page
  kontenArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 90,
  },
  karakterKamar: {
    width: 320,
    height: 320,
    resizeMode: "contain",
  },
  outfitBadge: {
    position: "absolute",
    top: 100,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  outfitText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  
  // Styles Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 340,
    maxHeight: "60%",
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
  },
  lemariGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  itemBaju: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E67E22",
    width: "40%",
    margin: "3%",
    aspectRatio: 1,
    justifyContent: "center",
  },
  itemSelected: {
    backgroundColor: "#D4EDDA",
    borderColor: "#27AE60",
    transform: [{ scale: 1.05 }],
  },
  itemBajuText: {
    marginTop: 8,
    color: "#4A2A00",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    marginTop: 15,
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
});