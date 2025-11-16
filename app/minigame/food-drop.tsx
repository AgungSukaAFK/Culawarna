import { useGameContext } from "@/app/context/GameContext";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { router } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
// --- PERBAIKAN 1: Impor dari 'react-native-reanimated' ---
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Konstanta Game ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const PLAYER_WIDTH = 120;
const PLAYER_HEIGHT = 120;
const OBJECT_SIZE = 40; // Ukuran gambar
const GAME_TIME_SECONDS = 30;
const KOIN_PER_FOOD = 2;
const FALL_SPEED_MIN = 2;
const FALL_SPEED_MAX = 5;
const BOMB_CHANCE = 0.2;
const SPAWN_INTERVAL_MS = 1200;

// --- PERBAIKAN 2: Menggunakan Aset Gambar ---
// (Pastikan path ini sesuai dengan struktur folder Anda)
const foodAssets = {
  apple: require("@/assets/images/apple.png"),
  banana: require("@/assets/images/banana.png"),
  bread: require("@/assets/images/bread.png"),
};
const bombAsset = require("@/assets/images/bomb.png");
const foodKeys = Object.keys(foodAssets) as (keyof typeof foodAssets)[];

interface FallingObjectData {
  id: number;
  x: number;
  yStart: number;
  type: "food" | "bomb";
  image: ImageSourcePropType;
  speed: number;
}

// --- KOMPONEN OBJEK JATUH (DIPERBARUI) ---
const FallingObjectComponent: React.FC<{
  data: FallingObjectData;
  playerX: SharedValue<number>;
  onCatch: (id: number) => void;
  onBomb: () => void;
  onMiss: (id: number) => void;
  isGameActive: SharedValue<boolean>;
}> = memo(({ data, playerX, onCatch, onBomb, onMiss, isGameActive }) => {
  const { id, x, yStart, type, image, speed } = data;
  const y = useSharedValue(yStart);
  const isCaught = useSharedValue(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Efek animasi jatuh
  useEffect(() => {
    if (isGameActive.value) {
      y.value = withTiming(
        SCREEN_HEIGHT + OBJECT_SIZE,
        {
          duration: (SCREEN_HEIGHT / speed) * 30, // Durasi disesuaikan dengan speed
          easing: Easing.linear,
        },
        (finished) => {
          // Jika animasi selesai (meleset) dan BELUM tertangkap
          if (finished && !isCaught.value) {
            runOnJS(onMiss)(id);
          }
        }
      );
    }
  }, [isGameActive.value, y, speed, id, onMiss, isCaught]); // Gunakan isGameActive.value

  // Deteksi tabrakan
  useFrameCallback(() => {
    if (!isGameActive.value || isCaught.value) return;

    const pX = playerX.value;
    const oY = y.value;

    // --- PERBAIKAN 3: Logika Tabrakan Kepala (AABB Overlap) ---
    const playerBottomMargin = 30; // Sesuai style 'bottom: 30'
    const playerHeadHitbox = 40; // Hanya 40px area kepala yang dihitung
    const playerHorizontalPadding = 20; // Padding horizontal

    // Koordinat Y Pemain (Kepala)
    const playerHeadTopY = SCREEN_HEIGHT - playerBottomMargin - PLAYER_HEIGHT;
    const playerHeadBottomY = playerHeadTopY + playerHeadHitbox;

    // Koordinat Y Objek
    const objectTopY = oY;
    const objectBottomY = oY + OBJECT_SIZE;

    // Cek Vertikal (Overlap antara object dan kepala pemain)
    const isVerticalHit =
      objectBottomY > playerHeadTopY && objectTopY < playerHeadBottomY;

    // Koordinat X Pemain (Hitbox)
    const playerHitboxLeftX = pX + playerHorizontalPadding;
    const playerHitboxRightX = pX + PLAYER_WIDTH - playerHorizontalPadding;

    // Koordinat X Objek
    const objectLeftX = x;
    const objectRightX = x + OBJECT_SIZE;

    // Cek Horizontal (Overlap antara object dan hitbox pemain)
    const isHorizontalHit =
      objectRightX > playerHitboxLeftX && objectLeftX < playerHitboxRightX;

    // Hanya jika KEDUA axis tumpang tindih
    if (isVerticalHit && isHorizontalHit) {
      cancelAnimation(y); // Hentikan animasi jatuh
      isCaught.value = true;

      if (type === "bomb") {
        // Efek ledakan bom
        scale.value = withSequence(
          withTiming(1.8, { duration: 100 }),
          withTiming(0, { duration: 150 })
        );
        opacity.value = withDelay(50, withTiming(0, { duration: 200 }));
        runOnJS(onBomb)();
      } else {
        // Makanan tertangkap
        opacity.value = 0; // Langsung hilangkan
        runOnJS(onCatch)(id); // Update skor & state
      }
    }
  });

  // Style animasi untuk objek
  const animatedObjectStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: y.value },
        { scale: scale.value }, // Terapkan scale
      ],
    };
  });

  return (
    <Animated.View style={[styles.object, { left: x }, animatedObjectStyle]}>
      <Image source={image} style={styles.objectImage} />
    </Animated.View>
  );
});

// --- Komponen Game Utama (FoodDropScreen) ---
export default function FoodDropScreen() {
  const { state, dispatch } = useGameContext();
  const [objects, setObjects] = useState<FallingObjectData[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [countdown, setCountdown] = useState<string | number>(3);

  const playerX = useSharedValue(SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2);
  const isGameActiveSV = useSharedValue(false); // SharedValue untuk status game
  const objectIdCounter = useRef(0);

  const sfxCatchRef = useRef<Audio.Sound | null>(null);
  const sfxBombRef = useRef<Audio.Sound | null>(null);

  // Efek untuk audio & countdown
  useEffect(() => {
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: true });

    const loadSounds = async () => {
      try {
        const { sound: catchSound } = await Audio.Sound.createAsync(
          require("@/assets/audio/kuis.mp3"), // Ganti jika punya sfx 'catch'
          { volume: state.volume }
        );
        sfxCatchRef.current = catchSound;

        const { sound: bombSound } = await Audio.Sound.createAsync(
          require("@/assets/audio/home.mp3"), // Ganti jika punya sfx 'bomb'
          { volume: state.volume }
        );
        sfxBombRef.current = bombSound;
      } catch (error) {
        console.warn("Gagal memuat SFX:", error);
      }
    };
    loadSounds();

    // Countdown
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (typeof prev === "number" && prev > 1) return prev - 1;
        if (prev === 1) return "Mulai!";
        clearInterval(countdownTimer);
        // Update kedua state (React dan Reanimated)
        setIsGameActive(true);
        isGameActiveSV.value = true;
        return "";
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(countdownTimer);
      dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
      sfxCatchRef.current?.unloadAsync();
      sfxBombRef.current?.unloadAsync();
    };
  }, []);

  // Efek untuk sinkronisasi volume master
  useEffect(() => {
    sfxCatchRef.current?.setVolumeAsync(state.volume);
    sfxBombRef.current?.setVolumeAsync(state.volume);
  }, [state.volume]);

  // Efek untuk timer game
  useEffect(() => {
    if (!isGameActive || isGameOver) return;
    if (timeLeft <= 0) {
      handleGameWin();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameActive, isGameOver, timeLeft]);

  // Efek untuk spawning
  useEffect(() => {
    if (!isGameActive || isGameOver) return;
    const spawnTimer = setInterval(() => {
      const type = Math.random() < BOMB_CHANCE ? "bomb" : "food";
      // Logika untuk memilih gambar
      const randomFoodKey =
        foodKeys[Math.floor(Math.random() * foodKeys.length)];
      const image = type === "bomb" ? bombAsset : foodAssets[randomFoodKey];

      const newObjectData: FallingObjectData = {
        id: objectIdCounter.current++,
        x: Math.random() * (SCREEN_WIDTH - OBJECT_SIZE),
        yStart: -OBJECT_SIZE,
        type: type,
        image: image,
        speed:
          Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN) + FALL_SPEED_MIN,
      };
      setObjects((prev) => [...prev, newObjectData]);
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(spawnTimer);
  }, [isGameActive, isGameOver]);

  // Handler Gestur
  const gesture = Gesture.Pan()
    .onChange((e) => {
      const newX = playerX.value + e.changeX;
      playerX.value = Math.max(0, Math.min(newX, SCREEN_WIDTH - PLAYER_WIDTH));
    })
    .runOnJS(true);

  // Style Pemain
  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: playerX.value }],
    };
  });

  // Fungsi putar SFX
  const playCatchSound = () => {
    sfxCatchRef.current?.replayAsync();
  };

  const playBombSound = () => {
    sfxBombRef.current?.replayAsync();
  };

  // Fungsi Logika Game
  const handleCatchFood = (id: number) => {
    playCatchSound();
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
    setScore((prev) => prev + 1);
  };

  const onMiss = (id: number) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  const handleGameOver = () => {
    if (isGameOver) return;
    playBombSound();
    setIsGameOver(true);
    setIsGameActive(false);
    isGameActiveSV.value = false;
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    Alert.alert("BOOM!", "Kamu terkena bom!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleGameWin = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setIsGameActive(false);
    isGameActiveSV.value = false;
    const koinWon = score * KOIN_PER_FOOD;
    dispatch({ type: "TAMBAH_KOIN", payload: koinWon });
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    Alert.alert(
      "Waktu Habis!",
      `Kamu mengumpulkan ${score} makanan dan mendapat ${koinWon} koin!`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  // --- RENDER ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/homescreen_bg.png")}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {countdown ? (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          ) : (
            <>
              <View style={styles.gameHud}>
                <Text style={styles.hudText}>Skor: {score}</Text>
                <TouchableOpacity onPress={handleGameOver}>
                  <Ionicons name="stop-circle" size={32} color="#DC143C" />
                </TouchableOpacity>
                <Text style={styles.hudText}>Waktu: {timeLeft}d</Text>
              </View>

              <View style={styles.gameArea}>
                {objects.map((obj) => (
                  <FallingObjectComponent
                    key={obj.id}
                    data={obj}
                    playerX={playerX}
                    onCatch={handleCatchFood}
                    onBomb={handleGameOver}
                    onMiss={onMiss}
                    isGameActive={isGameActiveSV}
                  />
                ))}

                <GestureDetector gesture={gesture}>
                  <Animated.View style={[styles.player, playerAnimatedStyle]}>
                    <Image
                      source={require("@/assets/images/cula_character.png")}
                      style={styles.playerImage}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </>
          )}
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

// --- STYLESHEET (Diperbarui) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  gameHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginTop: Platform.OS === "android" ? 40 : 20,
    zIndex: 10,
  },
  hudText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  gameArea: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  player: {
    position: "absolute",
    bottom: 30,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    zIndex: 5,
    // borderWidth: 1, // Uncomment untuk debug hitbox
    // borderColor: 'red', // Uncomment untuk debug hitbox
  },
  playerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  object: {
    position: "absolute",
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    // borderWidth: 1, // Uncomment untuk debug hitbox
    // borderColor: 'blue', // Uncomment untuk debug hitbox
  },
  objectImage: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    resizeMode: "contain",
  },
});
