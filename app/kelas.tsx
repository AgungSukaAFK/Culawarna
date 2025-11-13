import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGameContext } from "@/app/context/GameContext";
import {
  ModalNavigasiProps,
  ModalPengaturanProps,
  NavButtonProps,
} from "@/app/types/gameTypes";

// --- INTERFACE LOKAL ---
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

// --- KOMPONEN-KOMPONEN INTERNAL (MODAL, BUTTON, DLL) ---

const NavButton: React.FC<NavButtonProps> = ({ onPress, icon, text }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    {icon}
    <Text style={styles.navButtonText}>{text}</Text>
  </TouchableOpacity>
);

// (Modal Materi BARU)
const ModalMateri: React.FC<ModalMateriProps> = ({
  visible,
  onClose,
  onSelectMateri,
}) => {
  const { state } = useGameContext();
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
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
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
                  onPress={() => onSelectMateri(m.id)}
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

// (Modal Kuis BARU)
const ModalKuis: React.FC<ModalKuisProps> = ({
  visible,
  onClose,
  onSelectKuis,
}) => {
  const { state } = useGameContext();
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
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
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
                  onPress={() => onSelectKuis(k.id)}
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

// (Modal Pengaturan - Disalin dari kamar.tsx)
const ModalPengaturan: React.FC<ModalPengaturanProps> = ({
  visible,
  onClose,
  onExit,
  volume,
  setVolume,
  onGunakanEnergi,
  onTambahEnergi,
  onDapatKoin,
  onDapatXP,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={{ alignItems: "center" }}
            style={{ width: "100%" }}
          >
            <Text style={styles.modalTitle}>Pengaturan</Text>
            <Text style={styles.sliderLabel}>Volume musik</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#4B0082"
            />
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>-- Tombol Testing --</Text>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={onGunakanEnergi}
              >
                <Text>Gunakan Energi (-10)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={onTambahEnergi}
              >
                <Text>Tambah Energi (+20)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={onDapatKoin}
              >
                <Text>Dapat Koin (+5)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.debugButton} onPress={onDapatXP}>
                <Text>Dapat XP (+3)</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.kembaliButton]}
                onPress={onClose}
              >
                <Ionicons name="arrow-back" size={16} color="white" />
                <Text style={styles.modalButtonText}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.keluarButton]}
                onPress={onExit}
              >
                <Ionicons name="home-outline" size={16} color="white" />
                <Text style={styles.modalButtonText}>Homescreen</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

// (Modal Navigasi Eksternal - Disalin dari kamar.tsx)
const ModalNavigasiEksternal: React.FC<ModalNavigasiProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pergi ke...</Text>
          <View style={styles.navigasiGrid}>
            <TouchableOpacity
              style={styles.navigasiModalButton}
              onPress={() => onNavigate("toko")}
            >
              <MaterialCommunityIcons name="store" size={30} color="#4A2A00" />
              <Text style={styles.navigasiModalText}>Toko Budaya</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigasiModalButton}
              onPress={() => onNavigate("riwayat")} // <-- Tambahkan Riwayat
            >
              <Ionicons name="document-text" size={30} color="#4A2A00" />
              <Text style={styles.navigasiModalText}>Riwayat Belajar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigasiModalButton}
              onPress={() => onNavigate("pantai")}
            >
              <Ionicons name="planet" size={30} color="#4A2A00" />
              <Text style={styles.navigasiModalText}>Pantai</Text>
            </TouchableOpacity>
          </View>
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

// --- LAYAR KELAS BUDAYA ---
export default function KelasBudayaScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameContext();

  const [isMateriVisible, setMateriVisible] = useState(false);
  const [isKuisVisible, setKuisVisible] = useState(false);
  const [isPengaturanVisible, setPengaturanVisible] = useState(false);
  const [isEnergiVisible, setEnergiVisible] = useState(false);
  const [isNavigasiVisible, setNavigasiVisible] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const handleExitToHome = () => {
    setPengaturanVisible(false);
    router.replace("/");
  };

  const handleNavigasiEksternal = (screen: string) => {
    setNavigasiVisible(false);
    console.log(`Navigasi ke: ${screen}`);
    if (screen === "riwayat") {
      router.push("/riwayat");
    }
  };

  const handleSelectMateri = (babId: string) => {
    setMateriVisible(false);

    // --- PERUBAHAN DI SINI ---
    // Logika lama:
    // // TODO: Buka PDF viewer
    // console.log(`Buka PDF untuk ${babId}`);

    // Logika baru: Navigasi ke layar materi
    router.push({ pathname: "/materi/[bab]", params: { bab: babId } });
    // --- AKHIR PERUBAHAN ---
  };

  const handleSelectKuis = (babId: string) => {
    setKuisVisible(false);
    // Cek energi & cooldown sebelum pindah halaman
    const KUIS_ENERGY_COST = 25;
    const KUIS_COOLDOWN_MS = 30 * 1000;

    if (state.energi < KUIS_ENERGY_COST) {
      alert("Si Cula lelah! Isi energi dulu di Dapur.");
      return;
    }

    const timeSinceLastQuiz = Date.now() - state.lastQuizTimestamp;
    if (timeSinceLastQuiz < KUIS_COOLDOWN_MS) {
      alert(
        `Harus menunggu ${Math.ceil(
          (KUIS_COOLDOWN_MS - timeSinceLastQuiz) / 1000
        )} detik lagi!`
      );
      return;
    }

    // Navigasi ke halaman kuis dinamis (pakai objek pathname + params untuk typing yang benar)
    router.push({ pathname: "/kuis/[bab]", params: { bab: babId } });
  };

  // Handler Debug
  const handleGunakanEnergi = () =>
    dispatch({ type: "GUNAKAN_ENERGI", payload: 10 });
  const handleTambahEnergi = () =>
    dispatch({ type: "TAMBAH_ENERGI", payload: 20 });
  const handleDapatKoin = () => dispatch({ type: "TAMBAH_KOIN", payload: 5 });
  const handleDapatXP = () => dispatch({ type: "TAMBAH_XP", payload: 3 });

  const energiPercentage = (state.energi / state.maxEnergi) * 100;

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4A2A00" />
      </View>
    );
  }

  return (
    // Ganti dengan background kelas budaya
    <ImageBackground
      source={require("@/assets/images/kelas_bg.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* ===== 1. HUD ATAS ===== */}
        <View style={styles.hudAtas}>
          <View style={styles.hudInfoKiri}>
            <Text style={styles.textNama}>Si Cula</Text>
            <Text style={styles.textXP}>
              XP {state.xp}/{state.xpToNextLevel} - {state.phase}
            </Text>
          </View>
          <View style={styles.hudInfoTengah}>
            <TouchableOpacity
              style={styles.tombolEnergi}
              onPress={() => setEnergiVisible(!isEnergiVisible)}
            >
              <View
                style={[styles.energiFill, { height: `${energiPercentage}%` }]}
              />
              <Ionicons
                name="flash"
                size={24}
                color="white"
                style={styles.energiIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.hudInfoKanan}>
            <MaterialCommunityIcons name="gold" size={24} color="#FFD700" />
            <Text style={styles.textKoin}>{state.koin}</Text>
          </View>
        </View>

        {isEnergiVisible && (
          <View style={styles.energiModal}>
            <Text style={styles.energiText}>
              Energi: {state.energi}/{state.maxEnergi}
            </Text>
          </View>
        )}

        {/* ===== 2. KONTEN KELAS BUDAYA ===== */}
        <View style={styles.kontenArea}>
          {/* Ini adalah tombol menu utama di halaman ini */}
          <TouchableOpacity
            style={styles.menuUtamaButton}
            onPress={() => setMateriVisible(true)}
          >
            <Ionicons name="book" size={40} color="#4A2A00" />
            <Text style={styles.menuUtamaText}>Materi Belajar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuUtamaButton}
            onPress={() => setKuisVisible(true)}
          >
            <Ionicons name="school" size={40} color="#4A2A00" />
            <Text style={styles.menuUtamaText}>Mulai Kuis</Text>
          </TouchableOpacity>
        </View>

        {/* ===== 3. NAVIGASI INTERNAL (Hanya 1 tombol kembali) ===== */}
        <View style={styles.intraNavContainer}>
          <TouchableOpacity
            style={styles.intraNavButton}
            onPress={() => router.replace("/kamar")} // Kembali ke Kamar
          >
            <Ionicons name="arrow-back-circle" size={50} color="#8A2BE2" />
          </TouchableOpacity>
        </View>

        {/* ===== 4. HUD BAWAH (Tombol Aksi disembunyikan/custom) ===== */}
        <View style={styles.hudBawah}>
          <NavButton
            onPress={() => setNavigasiVisible(true)}
            icon={<Ionicons name="map" size={24} color="white" />}
            text="Navigasi"
          />
          {/* Tombol tengah "Aksi" bisa dinonaktifkan atau diganti */}
          <View style={styles.navButtonDisabled}>
            <Ionicons name="book" size={24} color="#AAA" />
            <Text style={styles.navButtonTextDisabled}>Belajar</Text>
          </View>
          <NavButton
            onPress={() => setPengaturanVisible(true)}
            icon={<Ionicons name="cog" size={24} color="white" />}
            text="Pengaturan"
          />
        </View>

        {/* ===== 5. MODALS ===== */}
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
        <ModalPengaturan
          visible={isPengaturanVisible}
          onClose={() => setPengaturanVisible(false)}
          onExit={handleExitToHome}
          volume={volume}
          setVolume={setVolume}
          onGunakanEnergi={handleGunakanEnergi}
          onTambahEnergi={handleTambahEnergi}
          onDapatKoin={handleDapatKoin}
          onDapatXP={handleDapatXP}
        />
        <ModalNavigasiEksternal
          visible={isNavigasiVisible}
          onClose={() => setNavigasiVisible(false)}
          onNavigate={handleNavigasiEksternal}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- STYLESHEET (Banyak style disalin dari kamar.tsx) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D2B48C",
  },
  // --- HUD Atas ---
  hudAtas: {
    position: "absolute",
    top: Platform.OS === "android" ? Constants.statusBarHeight + 10 : 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 2,
  },
  hudInfoKiri: { flex: 1, alignItems: "flex-start" },
  hudInfoTengah: { flex: 1, alignItems: "center" },
  hudInfoKanan: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  textNama: { fontSize: 20, fontWeight: "bold", color: "black" },
  textXP: { fontSize: 14, color: "black" },
  textKoin: { fontSize: 18, fontWeight: "bold", color: "black", marginLeft: 5 },
  tombolEnergi: {
    backgroundColor: "#555",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  energiFill: {
    backgroundColor: "#FFC107",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  energiIcon: {
    zIndex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  energiModal: {
    position: "absolute",
    top: (Platform.OS === "android" ? Constants.statusBarHeight + 10 : 50) + 70,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 20,
  },
  energiText: { fontSize: 14, color: "#333" },

  // --- Konten Area ---
  kontenArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuUtamaButton: {
    backgroundColor: "rgba(255, 179, 71, 0.9)", // Oranye #FFB347
    borderColor: "#4A2A00",
    borderWidth: 5,
    borderRadius: 20,
    padding: 20,
    width: "70%",
    alignItems: "center",
    marginVertical: 10,
  },
  menuUtamaText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    marginTop: 10,
  },

  // --- Navigasi Internal ---
  intraNavContainer: {
    position: "absolute",
    bottom: 100,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "flex-start", // Hanya tombol kembali
    zIndex: 5,
  },
  intraNavButton: {
    opacity: 0.7,
  },

  // --- HUD Bawah ---
  hudBawah: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  navButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8A2BE2",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: 100,
    height: 70,
    elevation: 3,
    borderBottomWidth: 4,
    borderColor: "#4B0082",
  },
  navButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
  },
  navButtonDisabled: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#AAA",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: 100,
    height: 70,
    borderBottomWidth: 4,
    borderColor: "#777",
  },
  navButtonTextDisabled: {
    color: "#DDD",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
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
  sliderLabel: {
    fontSize: 16,
    color: "#4A2A00",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
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
  keluarButton: {
    backgroundColor: "#DC143C",
    borderColor: "#8B0000",
  },

  // --- Style Modal Navigasi / Kuis / Materi ---
  navigasiGrid: {
    width: "100%",
    alignItems: "center",
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
  disabledButton: {
    backgroundColor: "#AAA",
    opacity: 0.6,
  },
  completedButton: {
    backgroundColor: "#a0e8a0", // Hijau muda
  },

  // --- Style Debug ---
  debugSection: {
    width: "100%",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#4A2A00",
    paddingVertical: 15,
    marginVertical: 15,
    alignItems: "center",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderColor: "#CCC",
    borderWidth: 1,
  },
});
