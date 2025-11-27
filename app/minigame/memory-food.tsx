// Di dalam file: app/minigame/memory-food.tsx

import { CustomGameAlert } from "@/app/components/CustomGameAlert"; // <-- Import Custom Alert
import { useGameContext } from "@/app/context/GameContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- 1. MAPPING ASET MAKANAN KHAS BANTEN ---
const foodAssets: { [key: string]: ImageSourcePropType } = {
  pecakbandeng: require("@/assets/images/foods/pecakbandeng.png"),
  rabeg: require("@/assets/images/foods/rabeg.png"),
  emping: require("@/assets/images/foods/emping.png"),
  bintul: require("@/assets/images/foods/bintul.png"),
  gipang: require("@/assets/images/foods/gipang.png"),
  bugis: require("@/assets/images/foods/bugis.png"),
};

// --- TIPE DATA ---
interface Card {
  id: number;
  foodId: string;
  image: ImageSourcePropType;
  isFlipped: boolean;
  isMatched: boolean;
}

// --- KONFIGURASI LEVEL ---
const GAME_ITEMS = [
  { foodId: "pecakbandeng", image: foodAssets.pecakbandeng },
  { foodId: "rabeg", image: foodAssets.rabeg },
  { foodId: "emping", image: foodAssets.emping },
  { foodId: "bintul", image: foodAssets.bintul },
  { foodId: "gipang", image: foodAssets.gipang },
  { foodId: "bugis", image: foodAssets.bugis },
];

const KOIN_REWARD = 15;
const GAME_TIME_SECONDS = 45;

// Fungsi Acak (Fisher-Yates Shuffle)
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

// Membuat Papan Permainan
const createGameBoard = (): Card[] => {
  const pairedFoods = [...GAME_ITEMS, ...GAME_ITEMS];
  const shuffled = shuffleArray(pairedFoods);

  return shuffled.map((item, index) => ({
    id: index,
    foodId: item.foodId,
    image: item.image,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function MemoryFoodScreen() {
  const { dispatch } = useGameContext();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState<string | number>(3);

  // --- STATE ALERT CUSTOM ---
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    icon: "information-circle" as any,
    buttonText: "OK",
    onClose: () => {},
  });

  // --- SETUP AWAL & COUNTDOWN ---
  useEffect(() => {
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: true });

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (typeof prev === "number" && prev > 1) return prev - 1;
        if (prev === 1) return "Mulai!";
        clearInterval(countdownTimer);
        startGame();
        return "";
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    };
  }, []);

  // --- TIMER ---
  useEffect(() => {
    if (!isGameActive) return;

    // Jika waktu habis
    if (timeLeft <= 0) {
      setIsGameActive(false);

      // Ganti Alert.alert
      setAlertConfig({
        visible: true,
        title: "Waktu Habis! ⏰",
        message: "Yah, waktu memasak habis! Coba lagi ya.",
        icon: "time",
        buttonText: "Kembali",
        onClose: handleExitGame,
      });
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  // --- LOGIKA PENCOCOKAN ---
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [idx1, idx2] = flippedCards;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.foodId === card2.foodId) {
        // MATCH
        setCards((prev) =>
          prev.map((c) =>
            c.id === card1.id || c.id === card2.id
              ? { ...c, isMatched: true }
              : c
          )
        );
        setScore((prev) => prev + 1);
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        // TIDAK MATCH
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === card1.id || c.id === card2.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      }
    }
  }, [flippedCards, cards]);

  // --- CEK KEMENANGAN ---
  useEffect(() => {
    if (isGameActive && score === GAME_ITEMS.length) {
      setIsGameActive(false);
      dispatch({ type: "TAMBAH_KOIN", payload: KOIN_REWARD });

      // Ganti Alert.alert
      setAlertConfig({
        visible: true,
        title: "Luar Biasa! 🏆",
        message: `Kamu hafal semua menu!\n(+${KOIN_REWARD} Koin)`,
        icon: "trophy",
        buttonText: "Ambil Koin",
        onClose: handleExitGame,
      });
    }
  }, [score, isGameActive]);

  const startGame = () => {
    setCards(createGameBoard());
    setFlippedCards([]);
    setScore(0);
    setTimeLeft(GAME_TIME_SECONDS);
    setIsChecking(false);
    setIsGameActive(true);
  };

  const handleCardPress = (index: number) => {
    if (
      !isGameActive ||
      isChecking ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, index]);
  };

  const handleExitGame = () => {
    // Pastikan alert tertutup sebelum navigasi
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    router.back();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/homescreen_bg.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* --- CUSTOM ALERT --- */}
        <CustomGameAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          buttonText={alertConfig.buttonText}
          onClose={alertConfig.onClose}
        />

        {countdown ? (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : (
          <>
            {/* HUD */}
            <View style={styles.gameHud}>
              <View style={styles.hudItem}>
                <Ionicons name="restaurant" size={24} color="#FFD700" />
                <Text style={styles.hudText}>
                  {" "}
                  {score} / {GAME_ITEMS.length}
                </Text>
              </View>
              <View style={styles.hudItem}>
                <Ionicons name="time" size={24} color="#FFF" />
                <Text style={styles.hudText}> {timeLeft}s</Text>
              </View>
            </View>

            {/* Papan Permainan */}
            <View style={styles.boardContainer}>
              <View style={styles.gameBoard}>
                {cards.map((card, index) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.card,
                      card.isFlipped || card.isMatched
                        ? styles.cardFaceUp
                        : styles.cardFaceDown,
                      card.isMatched && styles.cardMatched,
                    ]}
                    onPress={() => handleCardPress(index)}
                    activeOpacity={0.8}
                    disabled={card.isFlipped || card.isMatched}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <Image
                        source={card.image}
                        style={styles.cardImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.cardBackText}>?</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tombol Keluar */}
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExitGame}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.exitButtonText}>Batal Main</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
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
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFD700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 10,
    elevation: 10,
  },
  gameHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    maxWidth: 400,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  hudItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  hudText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  boardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  gameBoard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 340, // Membatasi lebar agar grid 4 kolom (75px * 4 + margin)
  },
  card: {
    width: 70,
    height: 70,
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardFaceDown: {
    backgroundColor: "#6A5ACD", // Ungu slate
    borderColor: "#483D8B",
  },
  cardFaceUp: {
    backgroundColor: "#FFF8DC", // Putih gading
    borderColor: "#FF8C00",
  },
  cardMatched: {
    backgroundColor: "#90EE90", // Hijau muda
    borderColor: "#2E8B57",
    opacity: 0.8,
  },
  cardImage: {
    width: "85%",
    height: "85%",
  },
  cardBackText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
  },
  exitButton: {
    flexDirection: "row",
    backgroundColor: "#DC143C",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  exitButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
