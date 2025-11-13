// Di dalam file: app/_layout.tsx
// (GANTI SELURUH FILE ANDA DENGAN INI)

import { Audio } from "expo-av";
import { Stack, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { GameProvider, useGameContext } from "./context/GameContext";

// Definisikan tipe lagu dan path-nya
type TrackName = "home" | "game" | "kuis";
const trackMap: Record<TrackName, any> = {
  home: require("@/assets/audio/home.mp3"),
  game: require("@/assets/audio/game.mp3"),
  kuis: require("@/assets/audio/kuis.mp3"),
};

// Objek untuk menyimpan referensi ke SEMUA sound
interface SoundRefs {
  home: Audio.Sound | null;
  game: Audio.Sound | null;
  kuis: Audio.Sound | null;
}

/**
 * Komponen Manajer Audio
 */
function AudioManager() {
  const { state } = useGameContext();
  const pathname = usePathname();

  // Ref untuk menyimpan semua objek sound
  const soundRef = useRef<SoundRefs>({ home: null, game: null, kuis: null });
  // State untuk melacak apakah semua sound sudah siap
  const [isLoaded, setIsLoaded] = useState(false);

  // --- LANGKAH 1: Muat SEMUA audio sekali saat app pertama kali dibuka ---
  useEffect(() => {
    const loadAllAudio = async () => {
      console.log("[Audio] Memuat semua trek...");
      try {
        // Set mode audio agar bisa diputar meski dalam mode silent (iOS)
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

        setIsLoaded(true); // Tandai semua sudah siap
        console.log("[Audio] Semua trek berhasil dimuat.");
      } catch (e) {
        console.error("[Audio] Gagal memuat semua trek:", e);
      }
    };

    loadAllAudio();

    // Cleanup: Unload semua audio saat aplikasi ditutup
    return () => {
      console.log("[Audio] Unloading semua trek...");
      soundRef.current.home?.unloadAsync();
      soundRef.current.game?.unloadAsync();
      soundRef.current.kuis?.unloadAsync();
    };
  }, []); // <-- Array dependensi kosong, hanya berjalan sekali

  // --- LANGKAH 2: Ganti lagu berdasarkan 'pathname' ---
  useEffect(() => {
    if (!isLoaded) return; // Jangan lakukan apa-apa jika audio belum siap

    let newTrack: TrackName | null = null;
    if (pathname === "/") {
      newTrack = "home";
    } else if (["/kamar", "/dapur", "/ruangTamu"].includes(pathname)) {
      newTrack = "game";
    } else if (pathname.startsWith("/kuis") || pathname === "/kelas") {
      newTrack = "kuis";
    }

    const switchTrack = async () => {
      console.log(`[Audio] Pindah layar ke: ${pathname}, memutar: ${newTrack}`);
      try {
        // Loop semua sound yang kita punya
        for (const [trackName, sound] of Object.entries(soundRef.current)) {
          if (sound) {
            // Jika ini adalah lagu yang harus diputar
            if (trackName === newTrack) {
              await sound.playAsync();
            } else {
              // Jika ini lagu lain, PAUSE
              await sound.pauseAsync();
            }
          }
        }
      } catch (e) {
        console.error("[Audio] Gagal ganti trek:", e);
      }
    };

    switchTrack();
  }, [pathname, isLoaded]); // <-- Berjalan saat 'pathname' berubah atau saat 'isLoaded'

  // --- LANGKAH 3: Atur volume saat slider digerakkan ---
  useEffect(() => {
    if (!isLoaded) return;

    const setAllVolumes = async () => {
      console.log(`[Audio] Mengatur volume ke: ${state.volume}`);
      try {
        // Terapkan volume baru ke SEMUA sound
        await soundRef.current.home?.setVolumeAsync(state.volume);
        await soundRef.current.game?.setVolumeAsync(state.volume);
        await soundRef.current.kuis?.setVolumeAsync(state.volume);
      } catch (e) {
        console.warn(
          "[Audio] Gagal set volume (mungkin sound sedang memuat)",
          e
        );
      }
    };

    setAllVolumes();
  }, [state.volume]); // <-- Berjalan saat 'state.volume' berubah

  // --- LANGKAH 4: Tangani App State (Pause/Play) ---
  useEffect(() => {
    if (!isLoaded) return;

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // Cari tahu lagu apa yang sedang aktif
        let activeSound: Audio.Sound | null = null;

        // Periksa home
        if (soundRef.current.home) {
          const statusHome = await soundRef.current.home.getStatusAsync();
          if (
            "isLoaded" in statusHome &&
            statusHome.isLoaded &&
            statusHome.isPlaying
          ) {
            activeSound = soundRef.current.home;
          }
        }

        // Periksa game (hanya jika belum ketemu activeSound)
        if (!activeSound && soundRef.current.game) {
          const statusGame = await soundRef.current.game.getStatusAsync();
          if (
            "isLoaded" in statusGame &&
            statusGame.isLoaded &&
            statusGame.isPlaying
          ) {
            activeSound = soundRef.current.game;
          }
        }

        // Periksa kuis (hanya jika belum ketemu activeSound)
        if (!activeSound && soundRef.current.kuis) {
          const statusKuis = await soundRef.current.kuis.getStatusAsync();
          if (
            "isLoaded" in statusKuis &&
            statusKuis.isLoaded &&
            statusKuis.isPlaying
          ) {
            activeSound = soundRef.current.kuis;
          }
        }

        if (!activeSound) return;

        try {
          if (nextAppState.match(/inactive|background/)) {
            await activeSound.pauseAsync();
          } else if (nextAppState === "active") {
            await activeSound.playAsync();
          }
        } catch (e) {
          console.error("[Audio] Gagal pause/play:", e);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isLoaded]); // <-- Berjalan setelah 'isLoaded'

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
