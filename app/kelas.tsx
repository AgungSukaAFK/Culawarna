// Di dalam file: app/kelas.tsx

import { useSFX } from "@/app/_layout"; // <-- Import useSFX
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { HelpContent } from "@/app/types/gameTypes";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- INTERFACE MODAL LOKAL ---
interface ModalMateriProps {
  visible: boolean;
  onClose: () => void;
  onSelectMateri: (babId: string) => void;
}

interface ModalKuisProps {
  visible: boolean;
  onClose: () => void;
  onSelectKuis: (babId: string) => void;
}

// --- KOMPONEN MODAL MATERI ---
const ModalMateri: React.FC<ModalMateriProps> = ({
  visible,
  onClose,
  onSelectMateri,
}) => {
  const { state } = useGameContext();
  const { playSfx, playBtnSound } = useSFX(); // SFX Hook

  const materi = [
    { id: "bab1", title: "BAB 1: Kelompok Sosial" },
    { id: "bab2", title: "BAB 2: Permasalahan Sosial" },
    { id: "bab3", title: "BAB 3: Konflik Sosial" },
    { id: "bab4", title: "BAB 4: Harmoni Sosial" },
  ];

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
          <Text style={styles.modalTitle}>Materi Belajar</Text>
          <ScrollView style={{ width: "100%" }}>
            {materi.map((m) => {
              const progress = state.materiProgress[m.id];
              const isLocked = !progress?.unlocked;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.navigasiModalButton,
                    isLocked && styles.disabledButton,
                  ]}
                  disabled={isLocked}
                  onPress={() => {
                    playSfx("tap");
                    onSelectMateri(m.id);
                  }}
                >
                  <Ionicons
                    name={isLocked ? "lock-closed" : "book"}
                    size={30}
                    color="#4A2A00"
                  />
                  <Text style={styles.navigasiModalText}>{m.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalButton, styles.kembaliButton]}
            onPress={() => {
              playBtnSound();
              onClose();
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.modalButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- KOMPONEN MODAL KUIS ---
const ModalKuis: React.FC<ModalKuisProps> = ({
  visible,
  onClose,
  onSelectKuis,
}) => {
  const { state } = useGameContext();
  const { playSfx, playBtnSound } = useSFX(); // SFX Hook

  const kuis = [
    { id: "bab1", title: "Kuis BAB 1" },
    { id: "bab2", title: "Kuis BAB 2" },
    { id: "bab3", title: "Kuis BAB 3" },
    { id: "bab4", title: "Kuis BAB 4" },
  ];

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
          <Text style={styles.modalTitle}>Koleksi Kuis</Text>
          <ScrollView style={{ width: "100%" }}>
            {kuis.map((k) => {
              const progress = state.materiProgress[k.id];
              const isLocked = !progress?.unlocked;
              const isCompleted = progress?.completedQuiz;
              return (
                <TouchableOpacity
                  key={k.id}
                  style={[
                    styles.navigasiModalButton,
                    isLocked && styles.disabledButton,
                    isCompleted && styles.completedButton,
                  ]}
                  disabled={isLocked}
                  onPress={() => {
                    playSfx("tap");
                    onSelectKuis(k.id);
                  }}
                >
                  <Ionicons
                    name={
                      isLocked
                        ? "lock-closed"
                        : isCompleted
                        ? "checkmark-circle"
                        : "play-circle"
                    }
                    size={30}
                    color="#4A2A00"
                  />
                  <Text style={styles.navigasiModalText}>{k.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalButton, styles.kembaliButton]}
            onPress={() => {
              playBtnSound();
              onClose();
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.modalButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- LAYAR KELAS BUDAYA ---
export default function KelasBudayaScreen() {
  const router = useRouter();
  const { state } = useGameContext();
  const { playSfx, playBtnSound } = useSFX(); // Hook SFX

  const [isMateriVisible, setMateriVisible] = useState(false);
  const [isKuisVisible, setKuisVisible] = useState(false);

  // --- KONTEN BANTUAN ---
  const kelasHelpContent: HelpContent = {
    title: "Kelas Budaya 🏫",
    body: (
      <View>
        <Text style={styles.helpText}>
          Selamat datang di Kelas Budaya! Tempat Si Cula menimba ilmu Sosiologi.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Fitur Belajar:</Text>
        </Text>
        <Text style={styles.helpText}>
          • <Text style={styles.bold}>Materi Belajar:</Text> Baca rangkuman
          materi per bab.{"\n"}• <Text style={styles.bold}>Mulai Kuis:</Text>{" "}
          Kerjakan soal latihan untuk mendapatkan XP.
        </Text>

        <Text style={[styles.helpText, { marginTop: 10 }]}>
          <Text style={styles.bold}>Info Penting:</Text>
        </Text>
        <Text style={styles.helpText}>
          • Mengerjakan kuis membutuhkan <Text style={styles.bold}>Energi</Text>
          .{"\n"}• Bab baru akan terbuka otomatis saat Si Cula berevolusi.
        </Text>
      </View>
    ),
  };

  const handleSelectMateri = (babId: string) => {
    setMateriVisible(false);
    router.push({ pathname: "/materi/[bab]", params: { bab: babId } });
  };

  const handleSelectKuis = (babId: string) => {
    setKuisVisible(false);
    const KUIS_ENERGY_COST = 25;
    const KUIS_COOLDOWN_MS = 30 * 1000;

    if (state.energi < KUIS_ENERGY_COST) {
      playSfx("quiz_wrong"); // SFX Gagal
      Alert.alert("Lelah", "Si Cula lelah! Isi energi dulu di Dapur.");
      return;
    }

    const timeSinceLastQuiz = Date.now() - state.lastQuizTimestamp;
    if (timeSinceLastQuiz < KUIS_COOLDOWN_MS) {
      playSfx("quiz_wrong"); // SFX Gagal
      const waitSeconds = Math.ceil(
        (KUIS_COOLDOWN_MS - timeSinceLastQuiz) / 1000
      );
      Alert.alert(
        "Istirahat Dulu",
        `Harus menunggu ${waitSeconds} detik lagi sebelum kuis berikutnya!`
      );
      return;
    }

    router.push({ pathname: "/kuis/[bab]", params: { bab: babId } });
  };

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kelas_bg.png")}
      onPressNavLeft={() => router.replace("/kamar")}
      onPressNavRight={() => {}}
      helpContent={kelasHelpContent}
      middleNavButton={{
        onPress: () => {
          playBtnSound();
          Alert.alert("Info", "Kamu sedang berada di dalam Kelas.");
        },
        icon: <Ionicons name="school" size={24} color="white" />,
        text: "Belajar",
      }}
      pageModal={
        <>
          <ModalMateri
            visible={isMateriVisible}
            onClose={() => setMateriVisible(false)}
            onSelectMateri={handleSelectMateri}
          />
          <ModalKuis
            visible={isKuisVisible}
            onClose={() => setKuisVisible(false)}
            onSelectKuis={handleSelectKuis}
          />
        </>
      }
    >
      {/* KONTEN UTAMA */}
      <View style={styles.kontenArea}>
        {/* Tombol Materi */}
        <TouchableOpacity
          style={styles.menuUtamaButton}
          onPress={() => {
            playBtnSound();
            setMateriVisible(true);
          }}
        >
          <Ionicons name="book" size={40} color="#4A2A00" />
          <Text style={styles.menuUtamaText}>Materi Belajar</Text>
        </TouchableOpacity>

        {/* Tombol Kuis */}
        <TouchableOpacity
          style={styles.menuUtamaButton}
          onPress={() => {
            playBtnSound();
            setKuisVisible(true);
          }}
        >
          <Ionicons name="play-circle" size={40} color="#4A2A00" />
          <Text style={styles.menuUtamaText}>Mulai Kuis</Text>
        </TouchableOpacity>

        {/* Tombol Riwayat */}
        <TouchableOpacity
          style={[styles.menuUtamaButton, styles.historyButton]}
          onPress={() => {
            playBtnSound();
            router.push("/riwayat");
          }}
        >
          <MaterialCommunityIcons name="history" size={40} color="#4A2A00" />
          <Text style={styles.menuUtamaText}>Riwayat Nilai</Text>
        </TouchableOpacity>
      </View>
    </GameHUDLayout>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  // Styles Help
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
  // Layout Utama
  kontenArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  menuUtamaButton: {
    backgroundColor: "rgba(255, 179, 71, 0.9)",
    borderColor: "#4A2A00",
    borderWidth: 4,
    borderRadius: 20,
    padding: 15,
    width: "80%",
    maxWidth: 350,
    alignItems: "center",
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    elevation: 5,
  },
  historyButton: {
    backgroundColor: "#87CEEB",
    borderColor: "#4682B4",
  },
  menuUtamaText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    marginLeft: 15,
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
  },
  navigasiModalButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A2A00",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  navigasiModalText: {
    color: "#4A2A00",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 15,
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
  disabledButton: {
    backgroundColor: "#CCC",
    borderColor: "#999",
    opacity: 0.7,
  },
  completedButton: {
    backgroundColor: "#D4EDDA",
    borderColor: "#28A745",
  },
});