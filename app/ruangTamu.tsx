import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Impor Tipe, Layout, dan Konteks
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext"; //

// --- INTERFACE LOKAL ---
interface ModalDekorasiProps {
  visible: boolean;
  onClose: () => void;
  onPasangDekorasi: (dekorId: string) => void;
}

// --- KOMPONEN MODAL SPESIFIK RUANG TAMU ---
const ModalDekorasi: React.FC<ModalDekorasiProps> = ({
  visible,
  onClose,
  onPasangDekorasi,
}) => {
  // TODO: Ambil inventory dekorasi dari state
  const ownedDekorasi = [
    { id: "dekor-sofa-1", name: "Sofa Merah", icon: "couch" },
    { id: "dekor-lampu-1", name: "Lampu Meja", icon: "lightbulb" },
    { id: "dekor-lukisan-1", name: "Lukisan", icon: "image" },
  ];

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
              {ownedDekorasi.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemDekorasi}
                  onPress={() => onPasangDekorasi(item.id)}
                >
                  <FontAwesome5
                    name={item.icon as any}
                    size={40}
                    color="#4A2A00"
                  />
                  <Text style={styles.itemDekorasiText}>{item.name}</Text>
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
  const { state } = useGameContext();
  const [isDekorasiVisible, setDekorasiVisible] = useState<boolean>(false);

  // Handler spesifik halaman
  const handlePasangDekorasi = (dekorId: string) => {
    console.log("Pasang dekorasi:", dekorId);
    // TODO: dispatch aksi untuk mengubah state dekorasi
    setDekorasiVisible(false);
  };

  return (
    <GameHUDLayout
      // Latar belakang (ganti dengan aset 'ruangtamu_bg.png' jika sudah ada)
      backgroundImage={require("@/assets/images/guest.png")} //
      // Tombol navigasi internal
      onPressNavLeft={() => router.replace("/kamar")} // Ke Dapur
      onPressNavRight={() => router.replace("/dapur")} // Ke Kamar
      // Tombol aksi tengah
      middleNavButton={{
        onPress: () => setDekorasiVisible(true),
        icon: <FontAwesome5 name="couch" size={24} color="white" />,
        text: "Dekorasi",
      }}
      // Modal spesifik
      pageModal={
        <ModalDekorasi
          visible={isDekorasiVisible}
          onClose={() => setDekorasiVisible(false)}
          onPasangDekorasi={handlePasangDekorasi}
        />
      }
    >
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <Text style={styles.textPlaceholder}>(Ini Ruang Tamu)</Text>
        <Image
          source={require("@/assets/images/cula_character.png")} //
          style={styles.karakter}
        />
      </View>
    </GameHUDLayout>
  );
}

// --- STYLESHEET (Hanya style spesifik halaman + modal) ---
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
    flexWrap: "wrap", // Agar bisa ke baris baru
    justifyContent: "center", // Pusatkan item
    width: "100%",
  },
  itemDekorasi: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A2A00",
    width: "45%", // Buat jadi 2 kolom
    margin: 5, // Beri jarak antar item
  },
  itemDekorasiText: {
    marginTop: 5,
    color: "#4A2A00",
    fontWeight: "bold",
  },
});
