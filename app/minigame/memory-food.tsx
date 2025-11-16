// Di dalam file: app/minigame/memory-food.tsx
// (BUAT FILE BARU INI)

import { useGameContext } from "@/app/context/GameContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- TIPE & DATA UNTUK MINIGAME ---
interface Card {
  id: number;
  foodId: string;
  icon: React.ComponentProps<typeof FontAwesome5>["name"];
  isFlipped: boolean;
  isMatched: boolean;
}

const GAME_FOODS: Array<{
  foodId: string;
  icon: React.ComponentProps<typeof FontAwesome5>["name"];
}> = [
  { foodId: "sate-bandeng", icon: "fish" },
  { foodId: "nasi-uduk", icon: "cloud-meatball" },
  { foodId: "placeholder1", icon: "drumstick-bite" },
  { foodId: "placeholder2", icon: "carrot" },
  { foodId: "placeholder3", icon: "apple-alt" },
  { foodId: "placeholder4", icon: "cookie" },
];

const KOIN_REWARD = 10;
const GAME_TIME_SECONDS = 30;

// Fungsi untuk mengacak array
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

// Fungsi untuk membuat papan permainan
const createGameBoard = (): Card[] => {
  const pairedFoods = [...GAME_FOODS, ...GAME_FOODS];
  const shuffled = shuffleArray(pairedFoods);
  return shuffled.map((food, index) => ({
    id: index,
    foodId: food.foodId,
    icon: food.icon,
    isFlipped: false,
    isMatched: false,
  }));
};

// --- KOMPONEN FULL-SCREEN MINIGAME ---
export default function MemoryFoodScreen() {
  const { dispatch } = useGameContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState<string | number>(3); // <-- STATE BARU

  // --- EFEK UNTUK AUDIO & COUNTDOWN ---
  useEffect(() => {
    // 1. Set audio minigame aktif
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: true });

    // 2. Mulai Countdown
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (typeof prev === "number" && prev > 1) {
          return prev - 1;
        }
        if (prev === 1) {
          return "Mulai!";
        }
        // Setelah "Mulai!", hentikan interval ini
        clearInterval(countdownTimer);
        startGame(); // <-- Mulai game setelah countdown
        return ""; // Sembunyikan countdown
      });
    }, 1000);

    // 3. Cleanup effect (jika user keluar paksa)
    return () => {
      clearInterval(countdownTimer);
      dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    };
  }, []); // Hanya berjalan sekali saat layar dimuat

  // --- EFEK UNTUK TIMER GAME ---
  useEffect(() => {
    if (!isGameActive) return;

    if (timeLeft <= 0) {
      setIsGameActive(false);
      Alert.alert("Waktu Habis!", "Coba lagi nanti.", [
        { text: "OK", onPress: handleExitGame },
      ]);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  // --- EFEK UNTUK CEK KARTU ---
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.foodId === secondCard.foodId) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        setScore((prev) => prev + 1);
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  // --- EFEK UNTUK CEK KEMENANGAN ---
  useEffect(() => {
    if (isGameActive && score === GAME_FOODS.length) {
      setIsGameActive(false);
      dispatch({ type: "TAMBAH_KOIN", payload: KOIN_REWARD });
      Alert.alert("Kamu Menang!", `Kamu mendapatkan ${KOIN_REWARD} Koin!`, [
        { text: "OK", onPress: handleExitGame },
      ]);
    }
  }, [score, isGameActive]);

  // --- FUNGSI KONTROL GAME ---
  const startGame = () => {
    setCards(createGameBoard());
    setFlippedCards([]);
    setScore(0);
    setTimeLeft(GAME_TIME_SECONDS);
    setIsChecking(false);
    setIsGameActive(true); // <-- Game baru aktif setelah ini
  };

  const handleCardPress = (index: number) => {
    if (
      !isGameActive ||
      isChecking ||
      cards[index].isFlipped ||
      flippedCards.length === 2
    ) {
      return;
    }
    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards((prev) => [...prev, index]);
  };

  const handleExitGame = () => {
    dispatch({ type: "SET_MINIGAME_ACTIVE", payload: false });
    router.back();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/homescreen_bg.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Tampilkan Countdown Overlay */}
        {countdown ? (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : (
          /* Tampilkan Game */
          <>
            <View style={styles.gameHud}>
              <Text style={styles.hudText}>Skor: {score}</Text>
              <Text style={styles.hudText}>Waktu: {timeLeft}d</Text>
            </View>

            <View style={styles.gameBoard}>
              {cards.map((card, index) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    card.isFlipped ? styles.cardFlipped : styles.cardDown,
                    card.isMatched ? styles.cardMatched : null,
                  ]}
                  onPress={() => handleCardPress(index)}
                  disabled={!isGameActive || card.isFlipped}
                >
                  {card.isFlipped || card.isMatched ? (
                    <FontAwesome5 name={card.icon} size={30} color="#4A2A00" />
                  ) : (
                    <Text style={styles.cardText}>?</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalButton, styles.keluarButton]}
              onPress={handleExitGame}
            >
              <Ionicons name="stop" size={16} color="white" />
              <Text style={styles.modalButtonText}>Keluar</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- STYLESHEET BARU ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  // --- Countdown ---
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
  // --- Game ---
  gameHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 340,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginBottom: 20,
  },
  hudText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  gameBoard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 340,
  },
  card: {
    width: 70, // Sedikit lebih besar
    height: 90,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 3,
    cursor: "pointer",
  },
  cardDown: {
    backgroundColor: "#8A2BE2",
    borderColor: "#4B0082",
  },
  cardFlipped: {
    backgroundColor: "#FFF",
    borderColor: "#8A2BE2",
  },
  cardMatched: {
    backgroundColor: "#DDD",
    borderColor: "#AAA",
    opacity: 0.6,
  },
  cardText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  // --- Tombol ---
  modalButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    cursor: "pointer",
    marginTop: 20,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  keluarButton: {
    backgroundColor: "#DC143C", // Merah
    borderColor: "#8B0000",
  },
});
