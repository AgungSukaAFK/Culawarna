// Di dalam file: app/minigame/food-drop.tsx

import { CulaCharacter } from "@/app/components/CulaCharacter"; // <-- Import Karakter Pintar
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

// --- KONSTANTA GAME ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const PLAYER_WIDTH = 120;
const PLAYER_HEIGHT = 120;
const OBJECT_SIZE = 50; // Sedikit diperbesar agar makanan terlihat jelas
const GAME_TIME_SECONDS = 30;
const KOIN_PER_FOOD = 2;
const FALL_SPEED_MIN = 2.5; // Sedikit lebih cepat
const FALL_SPEED_MAX = 6;
const BOMB_CHANCE = 0.25; // 25% kemungkinan bom
const SPAWN_INTERVAL_MS = 1000; // Spawn lebih sering

// --- ASET MAKANAN ---
const foodAssets: { [key: string]: ImageSourcePropType } = {
  pecakbandeng: require("@/assets/images/foods/pecakbandeng.png"),
  rabeg: require("@/assets/images/foods/rabeg.png"),
  emping: require("@/assets/images/foods/emping.png"),
  bintul: require("@/assets/images/foods/bintul.png"),
  gipang: require("@/assets/images/foods/gipang.png"),
  bugis: require("@/assets/images/foods/bugis.png"),
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

// --- KOMPONEN OBJEK JATUH ---
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

  // Animasi Jatuh
  useEffect(() => {
    if (isGameActive.value) {
      y.value = withTiming(
        SCREEN_HEIGHT + OBJECT_SIZE,
        {
          duration: (SCREEN_HEIGHT / speed) * 15, // Faktor kecepatan disesuaikan
          easing: Easing.linear,
        },
        (finished) => {
          if (finished && !isCaught.value) {
            runOnJS(onMiss)(id);
          }
        }
      );
    }
  }, [isGameActive.value, y, speed, id, onMiss, isCaught]);

  // Deteksi Tabrakan (Collision Detection)
  useFrameCallback(() => {
    if (!isGameActive.value || isCaught.value) return;

    const pX = playerX.value;
    const oY = y.value;

    // Hitbox Pemain (Kepala)
    const playerBottomMargin = 30;
    const playerHeadHitbox = 50;
    const playerHorizontalPadding = 25;

    const playerHeadTopY = SCREEN_HEIGHT - playerBottomMargin - PLAYER_HEIGHT;
    const playerHeadBottomY = playerHeadTopY + playerHeadHitbox;

    const objectTopY = oY;
    const objectBottomY = oY + OBJECT_SIZE;

    const isVerticalHit =
      objectBottomY > playerHeadTopY && objectTopY < playerHeadBottomY;

    const playerHitboxLeftX = pX + playerHorizontalPadding;
    const playerHitboxRightX = pX + PLAYER_WIDTH - playerHorizontalPadding;

    const objectLeftX = x;
    const objectRightX = x + OBJECT_SIZE;

    const isHorizontalHit =
      objectRightX > playerHitboxLeftX && objectLeftX < playerHitboxRightX;

    if (isVerticalHit && isHorizontalHit) {
      cancelAnimation(y);
      isCaught.value = true;

      if (type === "bomb") {
        // Efek Ledakan
        scale.value = withSequence(
          withTiming(1.8, { duration: 100 }),
          withTiming(0, { duration: 150 })
        );
        opacity.value = withDelay(50, withTiming(0, { duration: 200 }));
        runOnJS(onBomb)();
      } else {
        // Tertangkap
        opacity.value = 0;
        runOnJS(onCatch)(id);
      }
    }
  });

  const animatedObjectStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: y.value }, { scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.object, { left: x }, animatedObjectStyle]}>
      <Image source={image} style={styles.objectImage} />
    </Animated.View>
  );
});

// --- LAYAR GAME UTAMA ---
export default function FoodDropScreen() {
  const { state, dispatch } = useGameContext();
  const [objects, setObjects] = useState<FallingObjectData[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [countdown, setCountdown] = useState<string | number>(3);

  const playerX = useSharedValue(SCREEN_WIDTH / 2 - PLAYER_WIDTH / 2);
  const isGameActiveSV = useSharedValue(false);
  const objectIdCounter = useRef(0);

  const sfxCatchRef = useRef<Audio.Sound | null>(null);
  const sfxBombRef = useRef<Audio.Sound | null>(null);

  // --- SETUP AUDIO & COUNTDOWN ---
  useEffect(() => {
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: true });

    const loadSounds = async () => {
      try {
        const { sound: catchSound } = await Audio.Sound.createAsync(
          require("@/assets/audio/kuis.mp3"),
          { volume: state.volume }
        );
        sfxCatchRef.current = catchSound;

        const { sound: bombSound } = await Audio.Sound.createAsync(
          require("@/assets/audio/home.mp3"),
          { volume: state.volume }
        );
        sfxBombRef.current = bombSound;
      } catch (error) {
        console.warn("Gagal memuat SFX:", error);
      }
    };
    loadSounds();

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (typeof prev === "number" && prev > 1) return prev - 1;
        if (prev === 1) return "Mulai!";
        clearInterval(countdownTimer);
        setIsGameActive(true);
        isGameActiveSV.value = true;
        return "";
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
      sfxCatchRef.current?.unloadAsync();
      sfxBombRef.current?.unloadAsync();
    };
  }, []);

  // --- UPDATE VOLUME ---
  useEffect(() => {
    sfxCatchRef.current?.setVolumeAsync(state.volume);
    sfxBombRef.current?.setVolumeAsync(state.volume);
  }, [state.volume]);

  // --- TIMER ---
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

  // --- SPAWNER OBJEK ---
  useEffect(() => {
    if (!isGameActive || isGameOver) return;
    const spawnTimer = setInterval(() => {
      const type = Math.random() < BOMB_CHANCE ? "bomb" : "food";

      // Pilih gambar acak
      let image;
      if (type === "bomb") {
        image = bombAsset;
      } else {
        const randomKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
        image = foodAssets[randomKey];
      }

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

  // --- GESTURE ---
  const gesture = Gesture.Pan()
    .onChange((e) => {
      const newX = playerX.value + e.changeX;
      playerX.value = Math.max(0, Math.min(newX, SCREEN_WIDTH - PLAYER_WIDTH));
    })
    .runOnJS(true);

  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: playerX.value }],
    };
  });

  const playCatchSound = () => {
    sfxCatchRef.current?.replayAsync();
  };

  const playBombSound = () => {
    sfxBombRef.current?.replayAsync();
  };

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
    Alert.alert("BOOM!", "Kamu terkena bom! Hati-hati ya.", [
      { text: "Kembali", onPress: () => router.back() },
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
      "Selesai!",
      `Kamu menangkap ${score} makanan!\n(+${koinWon} Koin)`,
      [{ text: "Mantap", onPress: () => router.back() }]
    );
  };

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
                    {/* Gunakan Karakter Pintar agar baju sesuai */}
                    <CulaCharacter style={styles.playerImage} />
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: "bold",
    color: "#FFD700",
    textShadowColor: "black",
    textShadowRadius: 10,
  },
  gameHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginTop: Platform.OS === "android" ? 40 : 20,
    zIndex: 10,
  },
  hudText: {
    fontSize: 20,
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
  },
  objectImage: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    resizeMode: "contain",
  },
});
