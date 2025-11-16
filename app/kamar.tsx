// Di dalam file: app/kamar.tsx
// (PERBARUI FILE ANDA)

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView, // <-- Impor ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Impor Tipe dan Layout
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { ModalLemariProps, Outfit } from "./types/gameTypes"; // <-- Impor Outfit

// --- KOMPONEN MODAL SPESIFIK KAMAR (Diperbarui) ---
const ModalLemari: React.FC<ModalLemariProps> = ({ visible, onClose }) => {
  // Ambil state langsung dari context
  const { state, dispatch } = useGameContext();

  const handleGanti = (itemType: keyof Outfit, itemId: string | null) => {
    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType, itemId },
    });
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
          <Text style={styles.modalTitle}>Lemari Baju</Text>
          <ScrollView style={{ width: "100%" }}>
            {/* --- Kategori Topi --- */}
            <Text style={styles.categoryTitle}>Topi</Text>
            <View style={styles.lemariGrid}>
              {/* Tombol Lepas Topi */}
              <TouchableOpacity
                style={[
                  styles.itemBaju,
                  state.currentOutfit.topiId === null && styles.itemSelected,
                ]}
                onPress={() => handleGanti("topiId", null)}
              >
                <Ionicons name="close-circle" size={40} color="#4A2A00" />
                <Text style={styles.itemBajuText}>Lepas</Text>
              </TouchableOpacity>
              {/* Render semua topi yang dimiliki */}
              {state.ownedTopi.map((itemId) => (
                <TouchableOpacity
                  key={itemId}
                  style={[
                    styles.itemBaju,
                    state.currentOutfit.topiId === itemId &&
                      styles.itemSelected,
                  ]}
                  onPress={() => handleGanti("topiId", itemId)}
                >
                  <FontAwesome5 name="hat-wizard" size={40} color="#4A2A00" />
                  <Text style={styles.itemBajuText}>{itemId}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* --- Kategori Baju --- */}
            <Text style={styles.categoryTitle}>Baju</Text>
            <View style={styles.lemariGrid}>
              {/* Tombol Lepas Baju */}
              <TouchableOpacity
                style={[
                  styles.itemBaju,
                  state.currentOutfit.bajuId === null && styles.itemSelected,
                ]}
                onPress={() => handleGanti("bajuId", null)}
              >
                <Ionicons name="close-circle" size={40} color="#4A2A00" />
                <Text style={styles.itemBajuText}>Lepas</Text>
              </TouchableOpacity>
              {/* Render semua baju yang dimiliki */}
              {state.ownedBaju.map((itemId) => (
                <TouchableOpacity
                  key={itemId}
                  style={[
                    styles.itemBaju,
                    state.currentOutfit.bajuId === itemId &&
                      styles.itemSelected,
                  ]}
                  onPress={() => handleGanti("bajuId", itemId)}
                >
                  <FontAwesome5 name="tshirt" size={40} color="#4A2A00" />
                  <Text style={styles.itemBajuText}>{itemId}</Text>
                </TouchableOpacity>
              ))}
            </View>
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

// --- LAYAR KAMAR ---
export default function KamarScreen() {
  const router = useRouter();
  const { state } = useGameContext(); // Hanya perlu state di sini
  const [isLemariVisible, setLemariVisible] = useState<boolean>(false);

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kamar_bg.png")}
      onPressNavLeft={() => router.replace("/dapur")}
      onPressNavRight={() => router.replace("/ruangTamu")}
      middleNavButton={{
        onPress: () => setLemariVisible(true),
        icon: (
          <MaterialCommunityIcons name="tshirt-crew" size={24} color="white" />
        ),
        text: "Lemari",
      }}
      pageModal={
        <ModalLemari
          visible={isLemariVisible}
          onClose={() => setLemariVisible(false)}
          // Hapus props onGantiBaju
        />
      }
    >
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <Text style={styles.textPlaceholder}>
          (Baju: {state.currentOutfit.bajuId || "Kosong"})
        </Text>
        <Text style={styles.textPlaceholder}>
          (Topi: {state.currentOutfit.topiId || "Kosong"})
        </Text>
        <Image
          source={require("@/assets/images/cula_character.png")}
          style={styles.karakterKamar}
        />
      </View>
    </GameHUDLayout>
  );
}

// --- STYLESHEET (Diperbarui) ---
const styles = StyleSheet.create({
  kontenArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 90,
  },
  karakterKamar: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  textPlaceholder: {
    fontSize: 14,
    color: "black",
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 5,
    borderRadius: 5,
    marginBottom: 5, // Beri jarak antar text
    zIndex: 1,
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
  modalButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
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
  // --- Style Modal Lemari (Baru) ---
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2A00",
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 5,
  },
  lemariGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // Biarkan item turun ke baris baru
    justifyContent: "flex-start", // Mulai dari kiri
    width: "100%",
  },
  itemBaju: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A2A00",
    width: "30%", // Buat jadi 3 kolom
    margin: 5, // Jarak antar item
  },
  itemSelected: {
    backgroundColor: "#d4edda", // Warna hijau
    borderColor: "#c3e6cb",
  },
  itemBajuText: {
    marginTop: 5,
    color: "#4A2A00",
    fontWeight: "bold",
    fontSize: 12,
  },
});
