// Di dalam file: app/_layout.tsx
// (GANTI SELURUH FILE ANDA DENGAN INI)

import { Audio } from "expo-av";
import { Stack, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { GameProvider, useGameContext } from "./context/GameContext";

// Definisikan tipe lagu dan path-nya
type TrackName = "home" | "game" | "kuis" | "minigame"; // <-- Tambah 'minigame'
const trackMap: Record<TrackName, any> = {
  home: require("@/assets/audio/home.mp3"),
  game: require("@/assets/audio/game.mp3"),
  kuis: require("@/assets/audio/kuis.mp3"),
  minigame: require("@/assets/audio/kuis.mp3"), // <-- Pake audio kuis untuk minigame
};

// Objek untuk menyimpan referensi ke SEMUA sound
interface SoundRefs {
  home: Audio.Sound | null;
  game: Audio.Sound | null;
  kuis: Audio.Sound | null;
  minigame: Audio.Sound | null; // <-- Tambah 'minigame'
}

/**
 * Komponen Manajer Audio
 */
function AudioManager() {
  const { state } = useGameContext();
  const pathname = usePathname();

  // Ref untuk menyimpan semua objek sound
  const soundRef = useRef<SoundRefs>({
    home: null,
    game: null,
    kuis: null,
    minigame: null, // <-- Tambah 'minigame'
  });
  // State untuk melacak apakah semua sound sudah siap
  const [isLoaded, setIsLoaded] = useState(false);
  // State untuk melacak trek mana yang HARUSNYA diputar
  const [activeTrack, setActiveTrack] = useState<TrackName | null>(null);

  // --- LANGKAH 1: Muat SEMUA audio ---
  useEffect(() => {
    const loadAllAudio = async () => {
      console.log("[Audio] Memuat semua trek...");
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });

        // Muat 'home'
        const { sound: homeSound } = await Audio.Sound.createAsync(
          trackMap.home,
          { isLooping: true, volume: state.volume }
        );
        soundRef.current.home = homeSound;

        // Muat 'game'
        const { sound: gameSound } = await Audio.Sound.createAsync(
          trackMap.game,
          { isLooping: true, volume: state.volume }
        );
        soundRef.current.game = gameSound;

        // Muat 'kuis'
        const { sound: kuisSound } = await Audio.Sound.createAsync(
          trackMap.kuis,
          { isLooping: true, volume: state.volume }
        );
        soundRef.current.kuis = kuisSound;

        // Muat 'minigame' (BARU)
        const { sound: minigameSound } = await Audio.Sound.createAsync(
          trackMap.minigame,
          { isLooping: true, volume: state.volume }
        );
        soundRef.current.minigame = minigameSound;

        setIsLoaded(true);
        console.log("[Audio] Semua trek berhasil dimuat.");
      } catch (e) {
        console.error("[Audio] Gagal memuat semua trek:", e);
      }
    };

    loadAllAudio();

    // Cleanup: Unload semua audio
    return () => {
      console.log("[Audio] Unloading semua trek...");
      soundRef.current.home?.unloadAsync();
      soundRef.current.game?.unloadAsync();
      soundRef.current.kuis?.unloadAsync();
      soundRef.current.minigame?.unloadAsync(); // <-- Tambah 'minigame'
    };
  }, []); // <-- Hanya berjalan sekali

  // --- LANGKAH 2: Tentukan trek mana yang harus aktif ---
  useEffect(() => {
    if (!isLoaded) return;

    // Jika minigame aktif, paksa putar 'minigame'
    if (state.isMinigameActive) {
      setActiveTrack("minigame");
      return;
    }

    // Jika tidak, tentukan berdasarkan pathname
    let newTrack: TrackName | null = null;
    if (pathname === "/" || pathname === "/pantai") {
      // <-- Tambah /pantai
      newTrack = "home";
    } else if (["/kamar", "/dapur", "/ruangTamu"].includes(pathname)) {
      newTrack = "game";
    } else if (pathname.startsWith("/kuis") || pathname === "/kelas") {
      newTrack = "kuis";
    }

    setActiveTrack(newTrack);
  }, [pathname, isLoaded, state.isMinigameActive]); // <-- Tambah dependency

  // --- LANGKAH 3: Putar/Pause trek yang aktif ---
  useEffect(() => {
    if (!isLoaded || !activeTrack) {
      // Jika tidak ada trek aktif (misal di /riwayat), matikan semua
      if (isLoaded) {
        Object.values(soundRef.current).forEach((sound) => sound?.pauseAsync());
      }
      return;
    }

    const switchTrack = async () => {
      console.log(`[Audio] Memutar trek: ${activeTrack}`);
      try {
        // Loop semua sound
        for (const [trackName, sound] of Object.entries(soundRef.current)) {
          if (sound) {
            if (trackName === activeTrack) {
              await sound.playAsync(); // Putar trek yang aktif
            } else {
              await sound.pauseAsync(); // Pause trek lainnya
            }
          }
        }
      } catch (e) {
        console.error("[Audio] Gagal ganti trek:", e);
      }
    };

    switchTrack();
  }, [activeTrack]); // <-- Berjalan saat activeTrack berubah

  // --- LANGKAH 4: Atur volume ---
  useEffect(() => {
    if (!isLoaded) return;

    const setAllVolumes = async () => {
      console.log(`[Audio] Mengatur volume ke: ${state.volume}`);
      try {
        await soundRef.current.home?.setVolumeAsync(state.volume);
        await soundRef.current.game?.setVolumeAsync(state.volume);
        await soundRef.current.kuis?.setVolumeAsync(state.volume);
        await soundRef.current.minigame?.setVolumeAsync(state.volume); // <-- Tambah 'minigame'
      } catch (e) {
        console.warn("[Audio] Gagal set volume", e);
      }
    };

    setAllVolumes();
  }, [state.volume]); // <-- Berjalan saat state.volume berubah

  // --- LANGKAH 5: Tangani App State (Background/Foreground) ---
  useEffect(() => {
    if (!isLoaded) return;

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // Dapatkan sound yang sedang aktif
        const soundToControl = activeTrack
          ? soundRef.current[activeTrack]
          : null;

        if (!soundToControl) return;

        try {
          if (nextAppState.match(/inactive|background/)) {
            await soundToControl.pauseAsync();
          } else if (nextAppState === "active") {
            await soundToControl.playAsync();
          }
        } catch (e) {
          console.error("[Audio] Gagal pause/play:", e);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isLoaded, activeTrack]); // <-- Tambah activeTrack

  return null; // Komponen ini tidak me-render UI
}

// --- Komponen Layout Utama ---
export default function RootLayout() {
  return (
    <GameProvider>
      <AudioManager />
      <Stack screenOptions={{ headerShown: false }} />
    </GameProvider>
  );
}
