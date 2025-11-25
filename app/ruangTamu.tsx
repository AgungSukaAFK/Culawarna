// Di dalam file: app/ruangTamu.tsx
// (PERBARUI FILE ANDA)

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

// Impor Tipe, Layout, dan Konteks
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { CulaCharacter } from "./components/CulaCharacter";
import { Outfit } from "./types/gameTypes"; // <-- Impor Outfit

// --- INTERFACE LOKAL ---
interface ModalDekorasiProps {
  visible: boolean;
  onClose: () => void;
  // Hapus onPasangDekorasi, modal akan handle sendiri
}

// --- KOMPONEN MODAL SPESIFIK RUANG TAMU (Diperbarui) ---
const ModalDekorasi: React.FC<ModalDekorasiProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();

  // Fungsi untuk memasang dekorasi
  const handlePasangDekorasi = (
    itemType: keyof Outfit,
    itemId: string | null
  ) => {
    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType, itemId },
    });
    // onClose(); // Opsional: tutup modal setelah memilih
  };

  // Fungsi untuk mendapatkan ikon (placeholder)
  const getIconForItem = (itemId: string) => {
    if (itemId === "dekor-golok") {
      return "gavel";
    }
    return "star"; // Ikon default
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
              {/* Tombol Lepas Dekorasi */}
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

              {/* Render item dari inventory */}
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
                  <Text style={styles.itemDekorasiText}>{itemId}</Text>
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

// --- LAYAR RUANG TAMU ---
export default function RuangTamuScreen() {
  const router = useRouter();
  const { state } = useGameContext(); // <-- Ambil state
  const [isDekorasiVisible, setDekorasiVisible] = useState<boolean>(false);

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/guest.png")}
      onPressNavLeft={() => router.replace("/kamar")}
      onPressNavRight={() => router.replace("/dapur")}
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
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <Text style={styles.textPlaceholder}>
          (Dekorasi: {state.currentOutfit.aksesorisId || "Kosong"})
        </Text>
        <CulaCharacter style={styles.karakter} />
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
  karakter: {
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
    marginBottom: -20,
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
  // --- Style Modal Dekorasi (BARU) ---
  dekorasiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Ubah ke flex-start
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
    margin: 5,
  },
  itemSelected: {
    backgroundColor: "#d4edda", // Warna hijau
    borderColor: "#c3e6cb",
  },
  itemDekorasiText: {
    marginTop: 5,
    color: "#4A2A00",
    fontWeight: "bold",
  },
});
