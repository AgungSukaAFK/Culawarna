import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  // --- STATE ---
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // --- HANDLERS ---
  const handlePlayPress = () => console.log("Mulai Main!");
  const handleInfoPress = () => console.log("Tombol Info Ditekan");
  const handleSettingsPress = () => setSettingsModalVisible(true);
  const handleExitGame = () => console.log("Keluar game");

  return (
    <ImageBackground
      // PATH DIPERBARUI: Menggunakan alias @/assets
      source={require("@/assets/images/homescreen_bg.png")}
      style={styles.background}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="auto" />

      <SafeAreaView style={styles.container}>
        {/* ZONA 1: LANGIT (Judul & Ikon) */}
        <View style={styles.skyZone}>
          {/* REVISI Tombol Info "Game-ish" */}
          <TouchableOpacity
            style={[styles.gameButton, styles.infoButton]}
            onPress={handleInfoPress}
          >
            {/* Ikon tetap vektor */}
            <Ionicons
              name="information-circle-outline"
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {/* REVISI Tombol Settings "Game-ish" */}
          <TouchableOpacity
            style={[styles.gameButton, styles.settingsButton]}
            onPress={handleSettingsPress}
          >
            {/* Ikon diganti kembali ke vektor */}
            <Ionicons name="cog-outline" size={30} color="white" />
          </TouchableOpacity>

          {/* Judul tetap di tengah */}
          <Image
            // PATH DIPERBARUI: Menggunakan alias @/assets
            source={require("@/assets/images/culawarna_title.png")}
            style={styles.titleImage}
            resizeMode="contain"
          />
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
          <Image
            // PATH DIPERBARUI: Menggunakan alias @/assets
            source={require("@/assets/images/cula_character.png")}
            style={styles.character}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>

      {/* MODAL PENGATURAN (Tidak ada perubahan) */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
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

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.kembaliButton]}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={16} color="white" />
                <Text style={styles.modalButtonText}>Kembali</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.keluarButton]}
                onPress={handleExitGame}
              >
                <Ionicons name="exit-outline" size={16} color="white" />
                <Text style={styles.modalButtonText}>Keluar</Text>
              </TouchableOpacity>
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
  },
  // Container dengan fix status bar (Tidak ada perubahan)
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  // --- ZONA LAYOUT (Tidak ada perubahan) ---
  skyZone: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  seaZone: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sandZone: {
    flex: 5,
  },
  // --- KOMPONEN HOME ---
  titleImage: {
    width: "80%",
    height: "60%",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(120, 80, 220, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
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
  },
  // REVISI: Tombol Game-ish
  gameButton: {
    position: "absolute",
    top: 15,
    zIndex: 10,
    width: 50, // Ukuran tombol
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25, // Bikin jadi lingkaran

    // STYLE "GAME-ISH" BARU (Tiru tombol Play)
    backgroundColor: "rgba(120, 80, 220, 0.85)", // Background ungu
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)", // Border putih transparan
  },
  // Style 'gameButtonIcon' DIHAPUS karena tidak terpakai
  infoButton: {
    left: 15,
  },
  settingsButton: {
    right: 15,
  },

  // --- STYLE MODAL BARU (Tidak ada perubahan) ---
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 300,
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
    justifyContent: "space-between",
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
});
