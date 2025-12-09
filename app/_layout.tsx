// Di dalam file: app/_layout.tsx

import { Audio } from "expo-av";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { GameProvider, useGameContext } from "./context/GameContext";

// Mencegah splash screen hilang otomatis sampai aset siap
SplashScreen.preventAutoHideAsync().catch(() => {});

// --- KONSTANTA AUDIO ---
export type TrackName = "home" | "game" | "kuis" | "minigame";
export type SFXName = "quiz_done" | "quiz_correct" | "quiz_wrong" | "tap" | "tap2";

// Map BGM
const trackMap: Record<TrackName, any> = {
  home: require("@/assets/audio/home.mp3"),
  game: require("@/assets/audio/game.mp3"),
  kuis: require("@/assets/audio/kuis.mp3"),
  minigame: require("@/assets/audio/kuis.mp3"),
};

// Map SFX
const sfxMap: Record<SFXName, any> = {
  quiz_done: require("@/assets/audio/quiz_done.mp3"),
  quiz_correct: require("@/assets/audio/quiz_correct.mp3"),
  quiz_wrong: require("@/assets/audio/quiz_wrong.mp3"),
  tap: require("@/assets/audio/tap.mp3"),
  tap2: require("@/assets/audio/tap2.mp3"),
};

interface SoundRefs {
  bgm: Record<TrackName, Audio.Sound | null>;
  sfx: Record<SFXName, Audio.Sound | null>;
}

// --- SFX CONTEXT ---
interface SFXContextProps {
  playSfx: (sfxName: SFXName) => void;
  playBtnSound: () => void;
}
const SFXContext = createContext<SFXContextProps | undefined>(undefined);

export const useSFX = () => {
  const context = useContext(SFXContext);
  if (!context) {
    return { playSfx: () => {}, playBtnSound: () => {} };
  }
  return context;
};

// --- AUDIO MANAGER ---
function AudioManager({ children }: { children: React.ReactNode }) {
  const { state } = useGameContext();
  
  const soundRef = useRef<SoundRefs>({ 
    bgm: { home: null, game: null, kuis: null, minigame: null }, 
    sfx: { quiz_done: null, quiz_correct: null, quiz_wrong: null, tap: null, tap2: null }
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTrack, setActiveTrack] = useState<TrackName | null>(null);

  // Helper load sound aman
  const loadSound = async (source: any, isLooping: boolean, initialVolume: number) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        source,
        { isLooping, volume: initialVolume }
      );
      return sound;
    } catch (error) {
      console.warn("Gagal memuat audio:", error);
      return null;
    }
  };

  // 1. Muat Audio (Hanya Sekali di Awal)
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        
        // Load BGM
        const bgmPromises = Object.entries(trackMap).map(async ([key, src]) => {
          const sound = await loadSound(src, true, state.volume);
          return { key, sound };
        });
        
        // Load SFX
        const sfxPromises = Object.entries(sfxMap).map(async ([key, src]) => {
          const sound = await loadSound(src, false, state.sfxVolume);
          return { key, sound };
        });

        const [bgmResults, sfxResults] = await Promise.all([
          Promise.all(bgmPromises), 
          Promise.all(sfxPromises)
        ]);

        bgmResults.forEach(({ key, sound }) => { (soundRef.current.bgm as any)[key] = sound; });
        sfxResults.forEach(({ key, sound }) => { (soundRef.current.sfx as any)[key] = sound; });

        setIsLoaded(true);
      } catch (e) {
        console.warn("Audio Init Error:", e);
        setIsLoaded(true); // Tetap lanjut agar app tidak stuck
      }
    };

    initAudio();

    return () => {
      Object.values(soundRef.current.bgm).forEach((s) => s?.unloadAsync());
      Object.values(soundRef.current.sfx).forEach((s) => s?.unloadAsync());
    };
  }, []);

  // 2. Logic Track Aktif (State Minigame harus diambil dari context, bukan pathname untuk minigame)
  // Tapi di kode sebelumnya kita pake pathname untuk logic dasar
  // Kita perlu akses pathname di sini, tapi usePathname harus di dalam komponen yg ada di dalam Router context?
  // AudioManager ada di _layout jadi aman pake usePathname dari expo-router
  // UPDATE: Pindahkan usePathname ke dalam AudioManager
  const pathnameHook = usePathname(); // Kita rename biar gak clash

  useEffect(() => {
    if (!isLoaded) return;
    
    if (state.isMinigameActive) {
      setActiveTrack("minigame");
      return;
    }

    let newTrack: TrackName | null = null;
    if (pathnameHook === "/" || pathnameHook === "/pantai") newTrack = "home";
    else if (["/kamar", "/dapur", "/ruangTamu"].includes(pathnameHook)) newTrack = "game";
    else if (pathnameHook.startsWith("/kuis") || pathnameHook === "/kelas" || pathnameHook === "/riwayat") newTrack = "kuis";
    
    setActiveTrack(newTrack);
  }, [pathnameHook, isLoaded, state.isMinigameActive]);

  // 3. Play/Pause BGM Logic
  useEffect(() => {
    if (!isLoaded) return;
    
    const managePlayback = async () => {
      for (const [key, sound] of Object.entries(soundRef.current.bgm)) {
        if (!sound) continue;
        try {
          const status = await sound.getStatusAsync();
          if (!status.isLoaded) continue;

          if (key === activeTrack) {
            if (!status.isPlaying) await sound.playAsync();
          } else {
            if (status.isPlaying) await sound.pauseAsync();
          }
        } catch (e) {
          // ignore error
        }
      }
    };
    managePlayback();
  }, [activeTrack, isLoaded]);

  // 4. Update Volume
  useEffect(() => {
    if (!isLoaded) return;

    const updateAllVolumes = async () => {
      // Update BGM
      for (const sound of Object.values(soundRef.current.bgm)) {
        if (sound) {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.setVolumeAsync(state.volume);
            }
          } catch (e) { console.warn("Vol BGM Error:", e); }
        }
      }

      // Update SFX
      for (const sound of Object.values(soundRef.current.sfx)) {
        if (sound) {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.setVolumeAsync(state.sfxVolume);
            }
          } catch (e) { console.warn("Vol SFX Error:", e); }
        }
      }
    };

    updateAllVolumes();
  }, [state.volume, state.sfxVolume, isLoaded]); 

  // 5. Helper Functions
  const playSfx = useCallback((name: SFXName) => {
    const sound = soundRef.current.sfx[name];
    if (sound) {
      sound.replayAsync().catch(() => {});
    }
  }, []);

  const playBtnSound = useCallback(() => {
    const randomSfx = Math.random() > 0.5 ? "tap" : "tap2";
    playSfx(randomSfx);
  }, [playSfx]);

  // 6. Handle Background/Foreground App State
  useEffect(() => {
    if (!isLoaded) return;
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      const soundToControl = activeTrack ? soundRef.current.bgm[activeTrack] : null;
      if (!soundToControl) return;
      try {
        if (nextAppState.match(/inactive|background/)) await soundToControl.pauseAsync();
        else if (nextAppState === "active") await soundToControl.playAsync();
      } catch (e) {}
    });
    return () => { subscription.remove(); };
  }, [isLoaded, activeTrack]);

  return (
    <SFXContext.Provider value={{ playSfx, playBtnSound }}>
      {children}
    </SFXContext.Provider>
  );
}

// --- ROOT LAYOUT ---
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const isWeb = Platform.OS === "web";

  return (
    <GameProvider>
      <AudioManager>
        {/* WRAPPER LAYOUT (Fix Web Layout) */}
        {/* Perhatikan baris di bawah ini sudah diperbaiki */}
        <View style={isWeb ? styles.webContainer : styles.nativeContainer}>
          <StatusBar style="light" />
          <View style={isWeb ? styles.webFrame : styles.nativeFrame}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
        </View>
      </AudioManager>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  nativeContainer: { flex: 1 },
  nativeFrame: { flex: 1 },
  webContainer: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
    // Gunakan 'any' casting jika TypeScript protes soal '100vh'
    height: Platform.OS === "web" ? ("100vh" as any) : "100%", 
  },
  webFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    maxHeight: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
});