// Di dalam file: app/_layout.tsx

import { Audio } from "expo-av";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar"; // Tambah StatusBar
import React, { useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native"; // Tambah Platform, View, StyleSheet
import { GameProvider, useGameContext } from "./context/GameContext";

// --- LOGIKA AUDIO MANAGER (TETAP SAMA) ---
type TrackName = "home" | "game" | "kuis" | "minigame";
const trackMap: Record<TrackName, any> = {
  home: require("@/assets/audio/home.mp3"),
  game: require("@/assets/audio/game.mp3"),
  kuis: require("@/assets/audio/kuis.mp3"),
  minigame: require("@/assets/audio/kuis.mp3"),
};

interface SoundRefs {
  home: Audio.Sound | null;
  game: Audio.Sound | null;
  kuis: Audio.Sound | null;
  minigame: Audio.Sound | null;
}

function AudioManager() {
  const { state } = useGameContext();
  const pathname = usePathname();
  const soundRef = useRef<SoundRefs>({
    home: null,
    game: null,
    kuis: null,
    minigame: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTrack, setActiveTrack] = useState<TrackName | null>(null);

  useEffect(() => {
    const loadAllAudio = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const loadSound = async (source: any) => {
          const { sound } = await Audio.Sound.createAsync(source, {
            isLooping: true,
            volume: state.volume,
          });
          return sound;
        };
        const [homeSound, gameSound, kuisSound, minigameSound] =
          await Promise.all([
            loadSound(trackMap.home),
            loadSound(trackMap.game),
            loadSound(trackMap.kuis),
            loadSound(trackMap.minigame),
          ]);
        soundRef.current = {
          home: homeSound,
          game: gameSound,
          kuis: kuisSound,
          minigame: minigameSound,
        };
        setIsLoaded(true);
      } catch (e) {
        console.error("[Audio] Error:", e);
      }
    };
    loadAllAudio();
    return () => {
      Object.values(soundRef.current).forEach((sound) => sound?.unloadAsync());
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (state.isMinigameActive) {
      setActiveTrack("minigame");
      return;
    }
    let newTrack: TrackName | null = null;
    if (pathname === "/" || pathname === "/pantai") newTrack = "home";
    else if (["/kamar", "/dapur", "/ruangTamu"].includes(pathname))
      newTrack = "game";
    else if (
      pathname.startsWith("/kuis") ||
      pathname === "/kelas" ||
      pathname === "/riwayat"
    )
      newTrack = "kuis";
    setActiveTrack(newTrack);
  }, [pathname, isLoaded, state.isMinigameActive]);

  useEffect(() => {
    if (!isLoaded) return;
    const switchTrack = async () => {
      try {
        for (const [trackName, sound] of Object.entries(soundRef.current)) {
          if (sound) {
            if (trackName === activeTrack) {
              const status = await sound.getStatusAsync();
              if (status.isLoaded && !status.isPlaying) await sound.playAsync();
            } else {
              const status = await sound.getStatusAsync();
              if (status.isLoaded && status.isPlaying) await sound.pauseAsync();
            }
          }
        }
      } catch (e) {
        console.error("[Audio] Gagal ganti trek:", e);
      }
    };
    switchTrack();
  }, [activeTrack, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const setAllVolumes = async () => {
      try {
        await Promise.all(
          Object.values(soundRef.current).map((sound) =>
            sound?.setVolumeAsync(state.volume)
          )
        );
      } catch (e) {}
    };
    setAllVolumes();
  }, [state.volume, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const soundToControl = activeTrack
          ? soundRef.current[activeTrack]
          : null;
        if (!soundToControl) return;
        try {
          if (nextAppState.match(/inactive|background/))
            await soundToControl.pauseAsync();
          else if (nextAppState === "active") await soundToControl.playAsync();
        } catch (e) {}
      }
    );
    return () => {
      subscription.remove();
    };
  }, [isLoaded, activeTrack]);

  return null;
}

// --- LAYOUT UTAMA DENGAN WRAPPER WEB ---
export default function RootLayout() {
  const isWeb = Platform.OS === "web";

  return (
    <GameProvider>
      <AudioManager />

      {/* Container Luar (Gelap di Web) */}
      <View style={isWeb ? styles.webContainer : styles.nativeContainer}>
        <StatusBar style="light" />

        {/* Frame HP (Tengah di Web) */}
        <View style={isWeb ? styles.webFrame : styles.nativeFrame}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  nativeContainer: { flex: 1 },
  nativeFrame: { flex: 1 },

  // Style Khusus Web
  webContainer: {
    flex: 1,
    backgroundColor: "#121212", // Background luar gelap
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
  },
  webFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 480, // <-- KUNCI: Lebar maksimal seperti HP
    maxHeight: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    // Opsional: Border tipis
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
});
