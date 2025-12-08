// Di dalam file: app/index.tsx

import { useSFX } from "@/app/_layout"; // <-- 1. Import useSFX
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameContext } from "./context/GameContext";

// --- KOMPONEN MODAL INFO ---
interface ModalInfoProps {
  visible: boolean;
  onClose: () => void;
}
const ModalInfo: React.FC<ModalInfoProps> = ({ visible, onClose }) => {
  const { playBtnSound } = useSFX(); // SFX Hook

  const teamMemberImages: ImageSourcePropType[] = [
    require("@/assets/profiles/aratifa.png"),
    require("@/assets/profiles/haura.png"),
    require("@/assets/profiles/maryani.png"),
    require("@/assets/profiles/naufal.png"),
    require("@/assets/profiles/umam.png"),
  ];
  const NAMA_GRUP_INSTAGRAM = "mammoours";

  const handleGroupInstaPress = () => {
    playBtnSound();
    Linking.openURL(`https://instagram.com/${NAMA_GRUP_INSTAGRAM}`);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={10} tint={Platform.OS === "web" ? "light" : "dark"} style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: "100%" }} contentContainerStyle={{ alignItems: "center" }}>
            <Text style={styles.modalTitle}>Tentang Culawarna</Text>
            <Text style={styles.aboutText}>
              Culawarna adalah game edukasi virtual pet untuk mempelajari konsep-konsep dasar Sosiologi.
              {"\n\n"}
              Pelihara Si Cula, bantu dia belajar dengan menjawab kuis Sosiologi, dan saksikan dia berevolusi!
            </Text>
            <Text style={styles.modalSubTitle}>Tim Pengembang</Text>
            {teamMemberImages.map((img, index) => (
              <View key={index} style={{ marginBottom: 20, alignItems: "center" }}>
                <Image source={img} style={styles.memberImage} resizeMode="cover" />
                {/* Anda bisa menambahkan nama di sini jika diinginkan */}
              </View>
            ))}
            <TouchableOpacity style={styles.groupInstaButton} onPress={handleGroupInstaPress}>
              <Ionicons name="logo-instagram" size={24} color="white" />
              <Text style={styles.groupInstaText}>@{NAMA_GRUP_INSTAGRAM}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.kembaliButton, { marginTop: 25, marginBottom: 10 }]} 
              onPress={() => {
                playBtnSound();
                onClose();
              }}
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
  const { playBtnSound } = useSFX(); // <-- 2. Panggil Hook useSFX

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const handlePlayPress = () => {
    playBtnSound();
    router.replace("/kamar");
  };

  const handleInfoPress = () => {
    playBtnSound();
    setIsInfoModalVisible(true);
  };

  const handleSettingsPress = () => {
    playBtnSound();
    setSettingsModalVisible(true);
  };

  const handleExitGame = () => {
    playBtnSound();
    BackHandler.exitApp();
  };

  const isWeb = Platform.OS === "web";

  // Wrapper Background
  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isWeb) {
      return (
        <ImageBackground 
          source={require("@/assets/images/homescreen_bg.png")} 
          style={styles.container}
          resizeMode="cover"
        >
          {children}
        </ImageBackground>
      );
    }
    return (
      <View style={styles.container}>
        <Video
          source={require("@/assets/bgvideo/pantai.mp4")}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted={true}
        />
        {children}
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="auto" />

      {/* Konten Utama */}
      <SafeAreaView style={styles.contentContainer} edges={["top"]}>
        
        {/* ZONA 1: LANGIT */}
        <View style={styles.skyZone}>
          <TouchableOpacity style={[styles.gameButton, styles.infoButton]} onPress={handleInfoPress}>
            <Ionicons name="information-circle-outline" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gameButton, styles.settingsButton]} onPress={handleSettingsPress}>
            <Ionicons name="cog-outline" size={30} color="white" />
          </TouchableOpacity>
          
          <Image source={require("@/assets/images/culawarna_title.png")} style={styles.titleImage} resizeMode="contain" />
          
          <Text style={styles.subtitleText}>
            Media Pembelajaran Sosiologi Kelas 11 Kurikulum Merdeka
          </Text>
        </View>

        {/* ZONA 2: LAUT */}
        <View style={styles.seaZone}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
            <Ionicons name="play" size={40} color="white" style={styles.playIcon} />
          </TouchableOpacity>
        </View>

        {/* ZONA 3: PASIR */}
        <View style={styles.sandZone}>
          <CulaCharacter style={styles.character} />
        </View>
      </SafeAreaView>

      {/* Modals */}
      <ModalInfo visible={isInfoModalVisible} onClose={() => setIsInfoModalVisible(false)} />

      <Modal visible={settingsModalVisible} transparent={true} animationType="fade" onRequestClose={() => setSettingsModalVisible(false)}>
        <BlurView intensity={10} tint={isWeb ? "light" : "dark"} style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pengaturan</Text>
            
            {/* Slider BGM */}
            <Text style={styles.sliderLabel}>Volume Musik (BGM)</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={state.volume}
              onValueChange={(newVolume) => dispatch({ type: "SET_VOLUME", payload: newVolume })}
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#4B0082"
            />

            {/* Slider SFX (BARU) */}
            <Text style={styles.sliderLabel}>Volume Efek Suara (SFX)</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={state.sfxVolume}
              onValueChange={(newVolume) => dispatch({ type: "SET_SFX_VOLUME", payload: newVolume })}
              minimumTrackTintColor="#E67E22" // Warna Oranye
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#E67E22"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.kembaliButton]} 
                onPress={() => {
                  playBtnSound();
                  setSettingsModalVisible(false);
                }}
              >
                <Ionicons name="arrow-back" size={16} color="white" />
                <Text style={styles.modalButtonText}>Kembali</Text>
              </TouchableOpacity>
              
              {!isWeb && (
                <TouchableOpacity style={[styles.modalButton, styles.keluarButton]} onPress={handleExitGame}>
                  <Ionicons name="exit-outline" size={16} color="white" />
                  <Text style={styles.modalButtonText}>Keluar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Modal>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", width: "100%", height: "100%" },
  contentContainer: { flex: 1 },
  skyZone: { flex: 3, alignItems: "center", justifyContent: "center", paddingTop: Platform.OS === "web" ? 30 : 0 },
   subtitleText: {
    color: "blue",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 20, // Agar tidak terlalu mepet di layar kecil
  },
  seaZone: { flex: 2, alignItems: "center", justifyContent: "center" },
  sandZone: { flex: 5 },
  titleImage: { width: "80%", maxWidth: 400, height: "50%", minHeight: 80 },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(120, 80, 220, 0.85)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.5)", cursor: "pointer" },
  playIcon: { marginLeft: 5 },
  character: { position: "absolute", bottom: 0, alignSelf: "center", width: "50%", height: "90%", maxWidth: 300, maxHeight: 400 },
  gameButton: { position: "absolute", top: Platform.OS === "web" ? 20 : 15, zIndex: 10, width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 25, backgroundColor: "rgba(120, 80, 220, 0.85)", borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.5)", cursor: "pointer" },
  infoButton: { left: 15 },
  settingsButton: { right: 15 },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: "90%", maxWidth: 340, maxHeight: "85%", backgroundColor: "#FFB347", borderRadius: 20, borderWidth: 5, borderColor: "#4A2A00", padding: 20, alignItems: "center", elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#4A2A00", marginBottom: 20 },
  sliderLabel: { fontSize: 16, color: "#4A2A00", marginBottom: 10, marginTop: 10 },
  slider: { width: "100%", height: 40, marginBottom: 10 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  modalButton: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, alignItems: "center", justifyContent: "center", borderBottomWidth: 4, cursor: "pointer" },
  modalButtonText: { color: "white", fontSize: 14, fontWeight: "bold", marginLeft: 5 },
  kembaliButton: { backgroundColor: "#8A2BE2", borderColor: "#4B0082" },
  keluarButton: { backgroundColor: "#DC143C", borderColor: "#8B0000" },
  aboutText: { fontSize: 15, color: "#4A2A00", textAlign: "center", marginBottom: 20, lineHeight: 22 },
  modalSubTitle: { fontSize: 20, fontWeight: "bold", color: "#4A2A00", marginBottom: 15, borderTopWidth: 2, borderTopColor: "rgba(74, 42, 0, 0.3)", paddingTop: 15, width: "100%", textAlign: "center" },
  memberImage: { width: "100%", height: undefined, aspectRatio: 4 / 5, borderRadius: 10, borderColor: "#4A2A00", borderWidth: 3, marginBottom: 15, backgroundColor: "#D2B48C" },
  groupInstaButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#C13584", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, elevation: 3, marginTop: 10, cursor: "pointer" },
  groupInstaText: { marginLeft: 10, fontSize: 16, fontWeight: "bold", color: "white" },
});