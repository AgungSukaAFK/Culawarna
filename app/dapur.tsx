import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useGameContext } from "@/app/context/GameContext";
import { FoodItem } from "./types/gameTypes";
import { CulaCharacter } from "./components/CulaCharacter";

interface ModalMakananProps {
  visible: boolean;
  onClose: () => void;
}

// --- KOMPONEN MODAL SPESIFIK DAPUR ---
const ModalMakanan: React.FC<ModalMakananProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // VVV PERBAIKAN DI SINI VVV
    let timer: ReturnType<typeof setInterval>; // Tipe yang lebih aman
    if (visible) {
      setNow(Date.now()); // Update langsung saat buka
      // Set timer untuk update UI waktu refill setiap detik
      timer = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(timer);
  }, [visible]);

  const handleKonsumsi = (foodId: string) => {
    dispatch({ type: "KONSUMSI_MAKANAN", payload: { foodId } });
  };
  const handleBeli = (foodId: string) => {
    dispatch({ type: "BELI_MAKANAN", payload: { foodId } });
  };
  const handleRefill = (foodId: string) => {
    dispatch({ type: "REFILL_MAKANAN", payload: { foodId } });
    setNow(Date.now()); // Update 'now' setelah refill
  };

  const REFILL_TIME_MS = 3 * 60 * 1000;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Tas Makanan</Text>
          <ScrollView style={{ width: "100%" }}>
            {Object.values(state.foodInventory).map((item: FoodItem) => {
              const sisaWaktu = item.refillTimestamp + REFILL_TIME_MS - now;
              const bisaRefill = sisaWaktu <= 0;
              const sisaMenit = Math.floor(sisaWaktu / 60000);
              const sisaDetik = Math.max(
                0,
                Math.floor((sisaWaktu % 60000) / 1000)
              ); // Pastikan tidak negatif

              return (
                <View key={item.id} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDesc}>
                      Energi: +{item.energyValue}
                    </Text>
                    <Text style={styles.foodDesc}>
                      Tumpukan: {item.currentStacks} / {item.maxStacks}
                    </Text>
                  </View>
                  <View style={styles.foodActions}>
                    <TouchableOpacity
                      style={[
                        styles.foodButton,
                        styles.konsumsiButton,
                        item.currentStacks === 0 && styles.disabledButton,
                      ]}
                      onPress={() => handleKonsumsi(item.id)}
                      disabled={item.currentStacks === 0}
                    >
                      <Text style={styles.foodButtonText}>Makan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.foodButton,
                        styles.beliButton,
                        (state.koin < item.cost ||
                          item.currentStacks >= item.maxStacks) &&
                          styles.disabledButton,
                      ]}
                      onPress={() => handleBeli(item.id)}
                      disabled={
                        state.koin < item.cost ||
                        item.currentStacks >= item.maxStacks
                      }
                    >
                      <Text style={styles.foodButtonText}>
                        Beli ({item.cost} Koin)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.foodButton,
                        styles.refillButton,
                        (!bisaRefill || item.currentStacks >= item.maxStacks) &&
                          styles.disabledButton,
                      ]}
                      onPress={() => handleRefill(item.id)}
                      disabled={
                        !bisaRefill || item.currentStacks >= item.maxStacks
                      }
                    >
                      <Text style={styles.foodButtonText}>
                        {bisaRefill
                          ? "Refill Gratis"
                          : `${sisaMenit}m ${sisaDetik}d`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
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

// --- LAYAR DAPUR ---
export default function DapurScreen() {
  const router = useRouter();
  const [isMakananVisible, setMakananVisible] = useState<boolean>(false);

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/dapur_bg.png")} //
      onPressNavLeft={() => router.replace("/ruangTamu")} //
      onPressNavRight={() => router.replace("/kamar")}
      middleNavButton={{
        onPress: () => setMakananVisible(true),
        icon: <Ionicons name="restaurant" size={24} color="white" />,
        text: "Makanan",
      }}
      pageModal={
        <ModalMakanan
          visible={isMakananVisible}
          onClose={() => setMakananVisible(false)}
        />
      }
    >
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <CulaCharacter style={styles.karakter} />
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
  // --- Style Modal Makanan ---
  foodItem: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A2A00",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 12,
    color: "#4A2A00",
  },
  foodActions: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  foodButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginTop: 4,
    minWidth: 80,
    alignItems: "center",
  },
  foodButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  konsumsiButton: {
    backgroundColor: "#28a745",
  },
  beliButton: {
    backgroundColor: "#007bff",
  },
  refillButton: {
    backgroundColor: "#ffc107",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
    opacity: 0.7,
  },
});
