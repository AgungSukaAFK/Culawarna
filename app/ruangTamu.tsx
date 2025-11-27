// Di dalam file: app/ruangTamu.tsx

import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { HelpContent, Outfit } from "@/app/types/gameTypes";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
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

interface ModalDekorasiProps {
  visible: boolean;
  onClose: () => void;
}

// --- MODAL DEKORASI ---
const ModalDekorasi: React.FC<ModalDekorasiProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();

  const handlePasangDekorasi = (
    itemType: keyof Outfit,
    itemId: string | null
  ) => {
    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType, itemId },
    });
  };

  const getIconForItem = (itemId: string) => {
    if (itemId.includes("golok")) return "gavel";
    if (itemId.includes("lukisan")) return "image";
    return "star";
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
          <Text style={styles.modalTitle}>Pilih Dekorasi</Text>
          <ScrollView style={{ width: "100%" }}>
            <View style={styles.dekorasiGrid}>
              {/* Tombol Lepas */}
              <TouchableOpacity
                style={[
                  styles.itemDekorasi,
                  state.currentOutfit.aksesorisId === null &&
                    styles.itemSelected,
                ]}
                onPress={() => handlePasangDekorasi("aksesorisId", null)}
              >
                <Ionicons name="close-circle" size={40} color="#4A2A00" />
                <Text style={styles.itemDekorasiText}>Lepas</Text>
              </TouchableOpacity>

              {/* List Item */}
              {state.ownedAksesoris.map((itemId) => (
                <TouchableOpacity
                  key={itemId}
                  style={[
                    styles.itemDekorasi,
                    state.currentOutfit.aksesorisId === itemId &&
                      styles.itemSelected,
                  ]}
                  onPress={() => handlePasangDekorasi("aksesorisId", itemId)}
                >
                  <FontAwesome5
                    name={getIconForItem(itemId) as any}
                    size={40}
                    color="#4A2A00"
                  />
                  <Text style={styles.itemDekorasiText}>
                    {itemId.replace("dekor-", "")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalButton, styles.kembaliButton]}
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

// --- SCREEN UTAMA ---
export default function RuangTamuScreen() {
  const router = useRouter();
  const { state } = useGameContext();
  const [isDekorasiVisible, setDekorasiVisible] = useState<boolean>(false);

  // --- KONTEN BANTUAN (Dipindahkan ke sini) ---
  const ruangTamuHelpContent: HelpContent = {
    title: "Ruang Tamu 🛋️",
    body: (
      <View>
        <Text style={styles.helpText}>Selamat datang di Ruang Tamu!</Text>
        <Text style={styles.helpText}>
          Di sini kamu bisa menghias rumah Si Cula agar terlihat lebih menarik.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Cara Menghias:</Text>
        </Text>
        <Text style={styles.helpText}>
          • Tekan tombol <Text style={styles.bold}>Dekorasi</Text> untuk membuka
          koleksi hiasan.
          {"\n"}• Pilih item yang sudah dibeli (misal: Pajangan Golok).
          {"\n"}• Tekan <Text style={styles.bold}>Lepas</Text> untuk mencopot
          hiasan.
        </Text>
      </View>
    ),
  };

  // --- LOGIKA GANTI BACKGROUND ---
  const backgroundSource =
    state.currentOutfit.aksesorisId === "dekor-golok"
      ? require("@/assets/images/guest-deco.png")
      : require("@/assets/images/guest.png");

  return (
    <GameHUDLayout
      backgroundImage={backgroundSource}
      onPressNavLeft={() => router.replace("/kamar")}
      onPressNavRight={() => router.replace("/dapur")}
      helpContent={ruangTamuHelpContent}
      middleNavButton={{
        onPress: () => setDekorasiVisible(true),
        icon: <FontAwesome5 name="couch" size={24} color="white" />,
        text: "Dekorasi",
      }}
      pageModal={
        <ModalDekorasi
          visible={isDekorasiVisible}
          onClose={() => setDekorasiVisible(false)}
        />
      }
    >
      <View style={styles.kontenArea}>
        {/* Karakter */}
        <CulaCharacter style={styles.karakter} />
      </View>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  // --- Styles Help ---
  helpText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
    color: "#4A2A00",
  },
  // --- Styles Page ---
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
  // --- Modal Styles ---
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 340,
    maxHeight: "80%",
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
  dekorasiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  itemDekorasi: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A2A00",
    width: "45%",
    margin: "2.5%",
  },
  itemSelected: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    borderWidth: 3,
  },
  itemDekorasiText: {
    marginTop: 5,
    color: "#4A2A00",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    marginTop: 20,
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
