// Di dalam file: app/components/GameHUDLayout.tsx

import { useGameContext } from "@/app/context/GameContext";
import {
  AppearanceMode,
  HelpContent,
  ModalNavigasiProps,
  ModalPengaturanProps,
  NavButtonProps,
} from "@/app/types/gameTypes";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { AVPlaybackSource, ResizeMode, Video } from "expo-av";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- KOMPONEN MODAL HELP ---
const ModalHelp: React.FC<{
  visible: boolean;
  content?: HelpContent;
  onClose: () => void;
}> = ({ visible, content, onClose }) => {
  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.helpModalContainer}>
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle" size={40} color="#4A2A00" />
            <Text style={styles.helpTitle}>{content.title}</Text>
          </View>

          <ScrollView style={styles.helpScroll}>
            {typeof content.body === "string" ? (
              <Text style={styles.helpBody}>{content.body}</Text>
            ) : (
              content.body
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalButton, styles.kembaliButton]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Saya Mengerti</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- KOMPONEN NAVIGASI BUTTON ---
const NavButton: React.FC<NavButtonProps> = ({ onPress, icon, text }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    {icon}
    <Text style={styles.navButtonText}>{text}</Text>
  </TouchableOpacity>
);

// --- MODAL PENGATURAN (UPDATE: OPSI TAMPILAN) ---
const ModalPengaturan: React.FC<ModalPengaturanProps> = ({
  visible,
  onClose,
  onExit,
  volume,
  setVolume,
  selectedAppearance, // Props Baru
  setAppearance, // Props Baru
  onGunakanEnergi,
  onTambahEnergi,
  onDapatKoin,
  onDapatXP,
}) => {
  const appearanceOptions: AppearanceMode[] = [
    "Default",
    "Baby",
    "Anak",
    "Remaja",
    "Dewasa",
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
          <ScrollView
            contentContainerStyle={{ alignItems: "center" }}
            style={{ width: "100%" }}
          >
            <Text style={styles.modalTitle}>Pengaturan</Text>

            {/* Volume Slider */}
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

            {/* Pilihan Tampilan (Appearance) */}
            <Text style={[styles.sliderLabel, { marginTop: 15 }]}>
              Tampilan Si Cula
            </Text>
            <Text style={styles.subLabel}>(Ubah visual tanpa ubah level)</Text>

            <View style={styles.appearanceGrid}>
              {appearanceOptions.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.appearanceButton,
                    selectedAppearance === mode &&
                      styles.appearanceButtonActive,
                  ]}
                  onPress={() => setAppearance(mode)}
                >
                  <Text
                    style={[
                      styles.appearanceText,
                      selectedAppearance === mode &&
                        styles.appearanceTextActive,
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Debug Section */}
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
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.keluarButton]}
                  onPress={onExit}
                >
                  <Ionicons name="home-outline" size={16} color="white" />
                  <Text style={styles.modalButtonText}>Homescreen</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- MODAL NAVIGASI EKSTERNAL ---
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
      <BlurView
        intensity={10}
        tint={Platform.OS === "web" ? "light" : "dark"}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pergi ke...</Text>
          <View style={styles.navigasiGrid}>
            <TouchableOpacity
              style={styles.navigasiModalButton}
              onPress={() => router.push("/toko")}
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
              onPress={() => router.push("/pantai")}
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

// --- INTERFACE PROPS ---
interface GameHUDLayoutProps {
  children: ReactNode;
  backgroundImage?: ImageSourcePropType;
  backgroundVideo?: AVPlaybackSource;
  middleNavButton: NavButtonProps;
  pageModal: ReactNode;
  onPressNavLeft: () => void;
  onPressNavRight: () => void;
  hideUI?: boolean;
  helpContent?: HelpContent;
}

// --- KOMPONEN UTAMA ---
export const GameHUDLayout: React.FC<GameHUDLayoutProps> = ({
  children,
  backgroundImage,
  backgroundVideo,
  middleNavButton,
  pageModal,
  onPressNavLeft,
  onPressNavRight,
  hideUI = false,
  helpContent,
}) => {
  const router = useRouter();
  const { state, dispatch } = useGameContext();

  const [isPengaturanVisible, setPengaturanVisible] = useState<boolean>(false);
  const [isEnergiVisible, setEnergiVisible] = useState<boolean>(false);
  const [isNavigasiVisible, setNavigasiVisible] = useState<boolean>(false);
  const [isHelpVisible, setHelpVisible] = useState<boolean>(false);

  const handleExitToHome = () => {
    setPengaturanVisible(false);
    router.replace("/");
  };

  const handleNavigasiEksternal = (screen: string) => {
    setNavigasiVisible(false);
    if (screen === "riwayat") {
      router.push("/riwayat");
    }
  };

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
        <Text style={styles.loadingText}>Memuat data Si Cula...</Text>
      </View>
    );
  }

  // Wrapper untuk Background (Video/Image)
  const ContentWrapper = ({ children }: { children: ReactNode }) => {
    if (backgroundVideo) {
      return (
        <View style={styles.container}>
          <Video
            source={backgroundVideo}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            isMuted={true}
          />
          {children}
        </View>
      );
    } else if (backgroundImage) {
      return (
        <ImageBackground source={backgroundImage} style={styles.container}>
          {children}
        </ImageBackground>
      );
    } else {
      return (
        <View style={[styles.container, { backgroundColor: "#87CEEB" }]}>
          {children}
        </View>
      );
    }
  };

  return (
    <ContentWrapper>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {!hideUI && (
          <>
            {/* HUD ATAS */}
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
                    style={[
                      styles.energiFill,
                      { height: `${energiPercentage}%` },
                    ]}
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

            {helpContent && (
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => setHelpVisible(true)}
              >
                <Ionicons name="help" size={30} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {children}

        {!hideUI && (
          <>
            <View style={styles.intraNavContainer}>
              <TouchableOpacity
                style={styles.intraNavButton}
                onPress={onPressNavLeft}
              >
                <Ionicons name="arrow-back-circle" size={50} color="#8A2BE2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.intraNavButton,
                  { opacity: onPressNavRight.name === "" ? 0 : 0.7 },
                ]}
                onPress={onPressNavRight}
                disabled={onPressNavRight.name === ""}
              >
                <Ionicons
                  name="arrow-forward-circle"
                  size={50}
                  color="#8A2BE2"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.hudBawah}>
              <NavButton
                onPress={() => setNavigasiVisible(true)}
                icon={<Ionicons name="map" size={24} color="white" />}
                text="Navigasi"
              />
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
          </>
        )}

        {pageModal}

        <ModalPengaturan
          visible={isPengaturanVisible}
          onClose={() => setPengaturanVisible(false)}
          onExit={handleExitToHome}
          volume={state.volume}
          setVolume={(val: any) =>
            dispatch({ type: "SET_VOLUME", payload: val })
          }
          // Props untuk Tampilan
          selectedAppearance={state.selectedAppearance || "Default"}
          setAppearance={(mode) =>
            dispatch({ type: "SET_APPEARANCE", payload: mode })
          }
          // Debug
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

        <ModalHelp
          visible={isHelpVisible}
          content={helpContent}
          onClose={() => setHelpVisible(false)}
        />
      </SafeAreaView>
    </ContentWrapper>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D2B48C",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4A2A00" },
  hudAtas: {
    position: "absolute",
    top:
      Platform.OS === "web"
        ? 10
        : Platform.OS === "android"
        ? Constants.statusBarHeight + 10
        : 50,
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
    maxWidth: 800,
    alignSelf: "center",
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
    cursor: "pointer",
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
    top: Platform.OS === "web" ? 70 : 110,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 20,
  },
  energiText: { fontSize: 14, color: "#333" },

  helpButton: {
    position: "absolute",
    top: Platform.OS === "web" ? 70 : 110,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#2980B9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
    borderWidth: 2,
    borderColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  helpModalContainer: {
    width: "85%",
    maxWidth: 400,
    maxHeight: "70%",
    backgroundColor: "#FFF8E7",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#4A2A00",
    padding: 20,
    alignItems: "center",
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#D2B48C",
    paddingBottom: 10,
    width: "100%",
    justifyContent: "center",
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
    marginLeft: 10,
  },
  helpScroll: { width: "100%", marginBottom: 20 },
  helpBody: { fontSize: 16, color: "#333", lineHeight: 24, textAlign: "left" },

  intraNavContainer: {
    position: "absolute",
    bottom: 100,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 5,
    maxWidth: 800,
    alignSelf: "center",
  },
  intraNavButton: { opacity: 0.7, cursor: "pointer" },
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
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
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
    cursor: "pointer",
  },
  navButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
  },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  subLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  slider: { width: "100%", height: 40, marginBottom: 20 },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    cursor: "pointer",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  kembaliButton: { backgroundColor: "#8A2BE2", borderColor: "#4B0082" },
  keluarButton: { backgroundColor: "#DC143C", borderColor: "#8B0000" },
  navigasiGrid: { width: "100%", alignItems: "center" },
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
    cursor: "pointer",
  },
  navigasiModalText: {
    color: "#4A2A00",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 15,
  },
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
    cursor: "pointer",
  },

  // Styles untuk Appearance Grid
  appearanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  appearanceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4A2A00",
    margin: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  appearanceButtonActive: {
    backgroundColor: "#4A2A00",
    borderColor: "#4A2A00",
  },
  appearanceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  appearanceTextActive: {
    color: "white",
  },
});
