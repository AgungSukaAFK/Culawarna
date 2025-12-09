// Di dalam file: app/ruangTamu.tsx

import { useSFX } from "@/app/_layout";
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { HelpContent } from "@/app/types/gameTypes";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalDekorasiProps {
  visible: boolean;
  onClose: () => void;
}

// --- MODAL DEKORASI ---
const ModalDekorasi: React.FC<ModalDekorasiProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();
  const { playSfx, playBtnSound } = useSFX(); 

  const handleGantiDekorasi = (itemId: string | null) => {
    playSfx("tap"); 

    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType: "aksesorisId", itemId },
    });
  };

  // Helper Label
  const getLabel = (id: string) => {
    if (id === "dekor-golok") return "Golok";
    if (id === "dekor-bedug") return "Bedug";
    if (id === "dekor-lukisan") return "Lukisan";
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
          <Text style={styles.modalTitle}>Koleksi Dekorasi</Text>
          <ScrollView style={{ width: "100%" }}>
            <View style={styles.lemariGrid}>
              
              {/* Opsi: Lepas */}
              <TouchableOpacity
                style={[
                  styles.itemDekor,
                  state.currentOutfit.aksesorisId === null &&
                    styles.itemSelected,
                ]}
                onPress={() => handleGantiDekorasi(null)}
              >
                <Ionicons name="close-circle-outline" size={35} color="#4A2A00" />
                <Text style={styles.itemDekorText}>Lepas</Text>
              </TouchableOpacity>

              {/* Opsi: List Dekorasi Milik Player */}
              {state.ownedAksesoris.map((itemId) => (
                <TouchableOpacity
                  key={itemId}
                  style={[
                    styles.itemDekor,
                    state.currentOutfit.aksesorisId === itemId &&
                      styles.itemSelected,
                  ]}
                  onPress={() => handleGantiDekorasi(itemId)}
                >
                  <FontAwesome5 name="gavel" size={30} color="#4A2A00" />
                  <Text style={styles.itemDekorText}>{getLabel(itemId)}</Text>
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

export default function RuangTamuScreen() {
  const router = useRouter();
  const { state } = useGameContext();
  const [isModalVisible, setModalVisible] = useState(false);

  // --- KONTEN BANTUAN (Dipindah ke dalam komponen) ---
  const ruangTamuHelpContent: HelpContent = {
    title: "Ruang Tamu 🛋️",
    body: (
      <View>
        <Text style={styles.helpText}>
          Tempat bersantai Si Cula! Kamu bisa menghias ruangan ini dengan dekorasi
          khas Banten.
        </Text>
        <Text style={styles.helpText}>
          • <Text style={styles.bold}>Dekorasi:</Text> Beli item dekorasi di Toko
          Budaya, lalu pasang di sini.
          {"\n"}• <Text style={styles.bold}>Contoh:</Text> Pajangan Golok, Bedug,
          Lukisan, dll.
        </Text>
      </View>
    ),
  };

  // Helper untuk menentukan Background Image
  const getBackgroundImage = (aksesorisId: string | null): ImageSourcePropType => {
    if (aksesorisId === "dekor-lukisan") {
      return require("@/assets/images/guest-deco2.png");
    }
    if (aksesorisId) {
      return require("@/assets/images/guest-deco.png");
    }
    return require("@/assets/images/guest.png");
  };

  return (
    <GameHUDLayout
      backgroundImage={getBackgroundImage(state.currentOutfit.aksesorisId)}
      onPressNavLeft={() => router.replace("/kamar")}
      onPressNavRight={() => router.replace("/dapur")}
      helpContent={ruangTamuHelpContent}
      middleNavButton={{
        onPress: () => setModalVisible(true),
        icon: <MaterialCommunityIcons name="lamp" size={24} color="white" />,
        text: "Dekorasi",
      }}
      pageModal={
        <ModalDekorasi
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      }
    >
      <View style={styles.kontenArea}>
        <CulaCharacter style={styles.karakter} />
      </View>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  helpText: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 5 },
  bold: { fontWeight: "bold", color: "#4A2A00" },

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
  itemDekor: {
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
  itemDekorText: {
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