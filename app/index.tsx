// Di dalam file: app/index.tsx
// (KODE LENGKAP - GANTI SELURUH FILE ANDA DENGAN INI)

import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
// Hapus Constants, kita tidak pakai statusBarHeight lagi
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// --- PERBAIKAN: Impor SafeAreaView dari context ---
import { SafeAreaView } from "react-native-safe-area-context";
import { CulaCharacter } from "./components/CulaCharacter";
import { useGameContext } from "./context/GameContext";

// --- Komponen Modal Info (Tetap sama) ---
interface ModalInfoProps {
  visible: boolean;
  onClose: () => void;
}
const ModalInfo: React.FC<ModalInfoProps> = ({ visible, onClose }) => {
  const teamMemberImages: ImageSourcePropType[] = [
    require("@/assets/profiles/aratifa.png"),
    require("@/assets/profiles/haura.png"),
    require("@/assets/profiles/maryani.png"),
    require("@/assets/profiles/naufal.png"),
    require("@/assets/profiles/umam.png"),
  ];
  const NAMA_GRUP_INSTAGRAM = "mammoours";

  const handleGroupInstaPress = () => {
    Linking.openURL(`https://instagram.com/${NAMA_GRUP_INSTAGRAM}`);
  };

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
            style={{ width: "100%" }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            <Text style={styles.modalTitle}>Tentang Culawarna</Text>
            <Text style={styles.aboutText}>
              Culawarna adalah game edukasi *virtual pet* untuk mempelajari
              konsep-konsep dasar Sosiologi.
              {"\n\n"}
              Pelihara Si Cula, bantu dia belajar dengan menjawab kuis
              Sosiologi, dan saksikan dia berevolusi! Aplikasi ini mengambil
              tema Budaya Banten sebagai latar cerita visualnya.
            </Text>
            <Text style={styles.modalSubTitle}>Tim Pengembang</Text>
            {teamMemberImages.map((img, index) => (
              <Image
                key={index}
                source={img}
                style={styles.memberImage}
                resizeMode="cover"
              />
            ))}
            <TouchableOpacity
              style={styles.groupInstaButton}
              onPress={handleGroupInstaPress}
            >
              <Ionicons name="logo-instagram" size={24} color="white" />
              <Text style={styles.groupInstaText}>@{NAMA_GRUP_INSTAGRAM}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.kembaliButton,
                { marginTop: 25, marginBottom: 10 },
              ]}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={16} color="white" />
              <Text style={styles.modalButtonText}>Kembali</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- KOMPONEN HOMESCREEN ---
export default function HomeScreen() {
  const { state, dispatch } = useGameContext();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const handlePlayPress = () => {
    console.log("Mulai Main!");
    router.replace("/kamar");
  };

  const handleInfoPress = () => setIsInfoModalVisible(true);
  const handleSettingsPress = () => setSettingsModalVisible(true);

  const handleExitGame = () => {
    BackHandler.exitApp();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/homescreen_bg.png")}
      style={styles.background}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="auto" />

      {/* --- PERBAIKAN: Ganti ke SafeAreaView yang benar --- */}
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* ZONA 1: LANGIT (Judul & Ikon) */}
        <View style={styles.skyZone}>
          <TouchableOpacity
            style={[styles.gameButton, styles.infoButton]}
            onPress={handleInfoPress}
          >
            <Ionicons
              name="information-circle-outline"
              size={32}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameButton, styles.settingsButton]}
            onPress={handleSettingsPress}
          >
            <Ionicons name="cog-outline" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={require("@/assets/images/culawarna_title.png")}
            style={styles.titleImage}
            resizeMode="contain"
          />
          {/* --- TEKS BARU DITAMBAHKAN DI SINI --- */}
          <Text style={styles.subtitleText}>
            Media Pembelajaran berbasis Game untuk Mata Pelajaran Sosiologi
            Kelas 11
          </Text>
          {/* --- AKHIR TEKS BARU --- */}
        </View>
        {/* ZONA 2: LAUT (Tombol Play) */}
        <View style={styles.seaZone}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
            <Ionicons
              name="play"
              size={40}
              color="white"
              style={styles.playIcon}
            />
          </TouchableOpacity>
        </View>
        {/* ZONA 3: PASIR (Karakter) */}
        <View style={styles.sandZone}>
          <CulaCharacter style={styles.character} />
        </View>
      </SafeAreaView>

      <ModalInfo
        visible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
      />

      {/* MODAL PENGATURAN */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <BlurView
          intensity={10}
          tint={Platform.OS === "web" ? "light" : "dark"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pengaturan</Text>

            <Text style={styles.sliderLabel}>Volume musik</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={state.volume}
              onValueChange={(newVolume) =>
                dispatch({ type: "SET_VOLUME", payload: newVolume })
              }
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#4B0082"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.kembaliButton]}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={16} color="white" />
                <Text style={styles.modalButtonText}>Kembali</Text>
              </TouchableOpacity>

              {/* Sembunyikan tombol Keluar di Web */}
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.keluarButton]}
                  onPress={handleExitGame}
                >
                  <Ionicons name="exit-outline" size={16} color="white" />
                  <Text style={styles.modalButtonText}>Keluar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Modal>
    </ImageBackground>
  );
}

// STYLESHEET
const styles = StyleSheet.create({
  background: {
    flex: 1,
    // Perbaikan untuk Web: Pastikan gambar cover penuh
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    // Hapus paddingTop, SafeAreaView yg mengatur
  },
  skyZone: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "web" ? 30 : 0,
  },
  seaZone: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sandZone: {
    flex: 5,
  },
  titleImage: {
    width: "80%",
    maxWidth: 400, // <-- Tambahkan maxWidth untuk web
    height: "60%",
    minHeight: 100, // <-- Tambahkan minHeight untuk web
  },
  // --- STYLE BARU UNTUK SUBTITLE ---
  subtitleText: {
    fontSize: Platform.OS === "web" ? 18 : 21,
    color: "#000080", // Biru tua, senada dengan title
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4, // Jarak dari title
    paddingHorizontal: 20,
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  // --- AKHIR STYLE BARU ---
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(120, 80, 220, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer", // <-- Tambahkan kursor untuk web
  },
  playIcon: {
    marginLeft: 5,
  },
  character: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: "50%",
    height: "90%",
    maxWidth: 300, // <-- Tambahkan maxWidth untuk web
    maxHeight: 400, // <-- Tambahkan maxHeight untuk web
  },
  gameButton: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 15,
    zIndex: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "rgba(120, 80, 220, 0.85)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer", // <-- Tambahkan kursor untuk web
  },
  infoButton: {
    left: 15,
  },
  settingsButton: {
    right: 15,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 340,
    maxHeight: "85%",
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
  sliderLabel: {
    fontSize: 16,
    color: "#4A2A00",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    cursor: "pointer", // <-- Tambahkan kursor untuk web
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
  aboutText: {
    fontSize: 15,
    color: "#4A2A00",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalSubTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 15,
    borderTopWidth: 2,
    borderTopColor: "rgba(74, 42, 0, 0.3)",
    paddingTop: 15,
    width: "100%",
    textAlign: "center",
  },
  memberImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 5,
    borderRadius: 10,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginBottom: 15,
    backgroundColor: "#D2B48C",
  },
  groupInstaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C13584",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    marginTop: 10,
    cursor: "pointer", // <-- Tambahkan kursor untuk web
  },
  groupInstaText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
