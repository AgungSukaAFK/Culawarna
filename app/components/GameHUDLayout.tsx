import { useGameContext } from "@/app/context/GameContext";
import {
  ModalNavigasiProps,
  ModalPengaturanProps,
  NavButtonProps,
} from "@/app/types/gameTypes";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { router, useRouter } from "expo-router";
import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- KOMPONEN-KOMPONEN INTERNAL ---

const NavButton: React.FC<NavButtonProps> = ({ onPress, icon, text }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    {icon}
    <Text style={styles.navButtonText}>{text}</Text>
  </TouchableOpacity>
);

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
              onPress={() => router.push("/kelas")}
            >
              <Ionicons name="school" size={30} color="#4A2A00" />
              <Text style={styles.navigasiModalText}>Kelas Budaya</Text>
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

// --- PROPS UNTUK LAYOUT ---
interface GameHUDLayoutProps {
  children: ReactNode;
  backgroundImage: ImageSourcePropType;
  middleNavButton: NavButtonProps; // Tombol aksi tengah yang unik
  pageModal: ReactNode; // Modal unik untuk halaman itu
  onPressNavLeft: () => void;
  onPressNavRight: () => void;
}

// --- KOMPONEN LAYOUT UTAMA ---
export const GameHUDLayout: React.FC<GameHUDLayoutProps> = ({
  children,
  backgroundImage,
  middleNavButton,
  pageModal,
  onPressNavLeft,
  onPressNavRight,
}) => {
  const router = useRouter();
  const { state, dispatch } = useGameContext();

  // State lokal untuk modal HUD
  const [isPengaturanVisible, setPengaturanVisible] = useState<boolean>(false);
  const [isEnergiVisible, setEnergiVisible] = useState<boolean>(false);
  const [isNavigasiVisible, setNavigasiVisible] = useState<boolean>(false);

  const handleExitToHome = () => {
    setPengaturanVisible(false);
    router.replace("/");
  };

  const handleNavigasiEksternal = (screen: string) => {
    setNavigasiVisible(false);
    console.log(`Navigasi ke: ${screen}`);
    // router.push(`/${screen}`);
  };

  // Handler Debug
  const handleGunakanEnergi = () =>
    dispatch({ type: "GUNAKAN_ENERGI", payload: 10 });
  const handleTambahEnergi = () =>
    dispatch({ type: "TAMBAH_ENERGI", payload: 20 });
  const handleDapatKoin = () => dispatch({ type: "TAMBAH_KOIN", payload: 5 });
  const handleDapatXP = () => dispatch({ type: "TAMBAH_XP", payload: 3 });

  // Hitung persentase energi
  const energiPercentage = (state.energi / state.maxEnergi) * 100;

  // Tampilkan loading jika state belum siap
  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4A2A00" />
        <Text style={styles.loadingText}>Memuat data Si Cula...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* ===== 1. HUD ATAS (Full-width) ===== */}
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

        {/* Modal Energi */}
        {isEnergiVisible && (
          <View style={styles.energiModal}>
            <Text style={styles.energiText}>
              Energi: {state.energi}/{state.maxEnergi}
            </Text>
          </View>
        )}

        {/* ===== 2. KONTEN HALAMAN (dari props.children) ===== */}
        {children}

        {/* ===== 3. NAVIGASI INTERNAL (Tombol Gede) ===== */}
        <View style={styles.intraNavContainer}>
          <TouchableOpacity
            style={styles.intraNavButton}
            onPress={onPressNavLeft}
          >
            <Ionicons name="arrow-back-circle" size={50} color="#8A2BE2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.intraNavButton}
            onPress={onPressNavRight}
          >
            <Ionicons name="arrow-forward-circle" size={50} color="#8A2BE2" />
          </TouchableOpacity>
        </View>

        {/* ===== 4. HUD BAWAH (Tombol Aksi dari Props) ===== */}
        <View style={styles.hudBawah}>
          <NavButton
            onPress={() => setNavigasiVisible(true)}
            icon={<Ionicons name="map" size={24} color="white" />}
            text="Navigasi"
          />
          {/* Tombol Tengah Dinamis */}
          <NavButton
            onPress={middleNavButton.onPress}
            icon={middleNavButton.icon}
            text={middleNavButton.text}
          />
          <NavButton
            onPress={() => setPengaturanVisible(true)}
            icon={<Ionicons name="cog" size={24} color="white" />}
            text="Pengaturan"
          />
        </View>

        {/* ===== 5. MODALS ===== */}
        {/* Modal spesifik halaman (Lemari/Makanan) */}
        {pageModal}

        {/* Modal HUD (Pengaturan & Navigasi) */}
        <ModalPengaturan
          visible={isPengaturanVisible}
          onClose={() => setPengaturanVisible(false)}
          onExit={handleExitToHome}
          volume={state.volume} //
          setVolume={(newVolume) => {
            const resolvedVolume =
              typeof newVolume === "function"
                ? newVolume(state.volume)
                : newVolume;
            dispatch({ type: "SET_VOLUME", payload: resolvedVolume });
          }}
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
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D2B48C",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4A2A00",
  },
  // --- HUD Atas (Full-width) ---
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
  hudInfoKiri: {
    flex: 1,
    alignItems: "flex-start",
  },
  hudInfoTengah: {
    flex: 1,
    alignItems: "center",
  },
  hudInfoKanan: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  textNama: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  textXP: {
    fontSize: 14,
    color: "black",
  },
  textKoin: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginLeft: 5,
  },
  // --- Tombol Energi ---
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
  // --- Modal Energi ---
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
  energiText: {
    fontSize: 14,
    color: "#333",
  },
  // --- Navigasi Internal ---
  intraNavContainer: {
    position: "absolute",
    bottom: 100,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
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
  // --- Style Modal Navigasi ---
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
