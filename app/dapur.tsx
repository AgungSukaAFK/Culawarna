// Di dalam file: app/dapur.tsx

import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { FoodItem, HelpContent } from "@/app/types/gameTypes";
import { FoodImages } from "@/app/utils/foodAssets";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- DAFTAR MAKANAN AKUMULATIF ---
const UNLOCKED_FOODS: { [key: string]: string[] } = {
  Baby: ["mutiara", "kue"],
  Anak: ["mutiara", "kue", "gipang", "bugis"],
  Remaja: ["mutiara", "kue", "gipang", "bugis", "bintul", "emping"],
  Dewasa: [
    "mutiara",
    "kue",
    "gipang",
    "bugis",
    "bintul",
    "emping",
    "rabeg",
    "pecakbandeng",
  ],
};

// (Hapus 'dapurHelpContent' dari sini agar tidak error)

interface ModalDapurProps {
  visible: boolean;
  onClose: () => void;
}

const ModalDapur: React.FC<ModalDapurProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let timer: any;
    if (visible) {
      setNow(Date.now());
      timer = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(timer);
  }, [visible]);

  const cookingCount = Object.values(state.foodInventory).filter(
    (f: FoodItem) => f.isCooking
  ).length;
  const MAX_SLOT = 2;

  const handleMasak = (item: FoodItem) => {
    if (cookingCount >= MAX_SLOT) {
      Alert.alert("Kompor Penuh!", "Tunggu masakan lain matang dulu ya.");
      return;
    }
    dispatch({ type: "MULAI_MASAK", payload: { foodId: item.id } });
  };

  const handleAmbil = (item: FoodItem) => {
    dispatch({ type: "AMBIL_MASAKAN", payload: { foodId: item.id } });
  };

  const handleMakan = (item: FoodItem) => {
    dispatch({ type: "KONSUMSI_MAKANAN", payload: { foodId: item.id } });
  };

  const visibleFoodKeys = UNLOCKED_FOODS[state.phase] || [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.headerModal}>
            <Text style={styles.modalTitle}>Dapur Si Cula</Text>
            <View style={styles.slotBadge}>
              <MaterialCommunityIcons name="stove" size={20} color="#FFF" />
              <Text style={styles.slotText}>
                Masak: {cookingCount}/{MAX_SLOT}
              </Text>
            </View>
          </View>

          <ScrollView style={{ width: "100%" }}>
            {visibleFoodKeys.map((key) => {
              const item = state.foodInventory[key];
              if (!item) return null;

              const finishTime = item.cookingStartTime + item.cookDuration;
              const timeLeft = Math.max(0, finishTime - now);
              const isReady = item.isCooking && timeLeft <= 0;

              return (
                <View key={item.id} style={styles.foodItem}>
                  <Image
                    source={(FoodImages as any)[item.id]}
                    style={styles.foodImage}
                    resizeMode="contain"
                  />

                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDesc}>
                      Energi +{item.energyValue}
                    </Text>
                    <Text style={styles.foodDesc}>
                      Stok: {item.currentStacks}/{item.maxStacks}
                    </Text>
                  </View>

                  <View style={styles.foodActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.btnMakan,
                        item.currentStacks === 0 && styles.btnDisabled,
                      ]}
                      onPress={() => handleMakan(item)}
                      disabled={item.currentStacks === 0}
                    >
                      <Text style={styles.btnText}>Makan</Text>
                    </TouchableOpacity>

                    {item.isCooking ? (
                      isReady ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.btnSajikan]}
                          onPress={() => handleAmbil(item)}
                        >
                          <Text style={styles.btnText}>Sajikan</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.actionButton, styles.btnTimer]}>
                          <Text style={styles.btnText}>
                            {Math.ceil(timeLeft / 1000)}s
                          </Text>
                        </View>
                      )
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.btnMasak,
                          (cookingCount >= MAX_SLOT ||
                            item.currentStacks >= item.maxStacks) &&
                            styles.btnDisabled,
                        ]}
                        onPress={() => handleMasak(item)}
                        disabled={
                          cookingCount >= MAX_SLOT ||
                          item.currentStacks >= item.maxStacks
                        }
                      >
                        <Text style={styles.btnText}>
                          {item.currentStacks >= item.maxStacks
                            ? "Penuh"
                            : "Masak"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
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

export default function DapurScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  // --- PINDAHKAN KONTEN BANTUAN KE SINI ---
  // Dengan memindahkannya ke dalam komponen, variabel 'styles' sudah terdefinisi
  // saat kode ini dijalankan.
  const dapurHelpContent: HelpContent = {
    title: "Dapur & Memasak 🍳",
    body: (
      <View>
        <Text style={styles.helpText}>
          Selamat datang di Dapur! Di sini kamu bisa memasak makanan khas Banten
          untuk mengisi energi Si Cula.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Cara Memasak:</Text>
        </Text>
        <Text style={styles.helpText}>
          1. Pilih menu makanan yang tersedia.{"\n"}
          2. Tekan tombol <Text style={styles.bold}>Masak</Text> untuk memulai
          proses.{"\n"}
          3. Tunggu waktu memasak selesai (lihat timer).{"\n"}
          4. Setelah matang, tekan <Text style={styles.bold}>Sajikan</Text>{" "}
          untuk memasukkannya ke stok.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Aturan Dapur:</Text>
        </Text>
        <Text style={styles.helpText}>
          • Kamu hanya punya <Text style={styles.bold}>2 Slot Kompor</Text>.
          Jadi hanya bisa memasak 2 makanan sekaligus.{"\n"}• Menu makanan baru
          akan terbuka seiring pertumbuhan Si Cula (Baby → Dewasa).
        </Text>
      </View>
    ),
  };

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/dapur_bg.png")}
      onPressNavLeft={() => router.replace("/ruangTamu")}
      onPressNavRight={() => router.replace("/kamar")}
      helpContent={dapurHelpContent} // Pass konten ke layout
      middleNavButton={{
        onPress: () => setModalVisible(true),
        icon: <Ionicons name="restaurant" size={24} color="white" />,
        text: "Masak",
      }}
      pageModal={
        <ModalDapur
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
  // --- Styles Halaman Dapur ---
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
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: "#FFB347",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#4A2A00",
    padding: 15,
    alignItems: "center",
  },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderColor: "rgba(74,42,0,0.2)",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  slotBadge: {
    flexDirection: "row",
    backgroundColor: "#D35400",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  slotText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
  },
  foodItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E67E22",
  },
  foodImage: {
    width: 55,
    height: 55,
    marginRight: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  foodDesc: {
    fontSize: 11,
    color: "#555",
  },
  foodActions: {
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-end",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  btnMakan: { backgroundColor: "#27AE60" },
  btnMasak: { backgroundColor: "#E67E22" },
  btnSajikan: { backgroundColor: "#2980B9" },
  btnTimer: { backgroundColor: "#7F8C8D" },
  btnDisabled: { backgroundColor: "#BDC3C7", opacity: 0.6 },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    marginTop: 10,
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
