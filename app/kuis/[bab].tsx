import { useGameContext } from "@/app/context/GameContext";
import { QuizQuestion } from "@/app/types/gameTypes";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Impor data kuis JSON
import AllQuizData from "@/app/data/quizData.json";
import Constants from "expo-constants";
import { ActivityIndicator } from "react-native";

type Answer = string | boolean | null;

export default function KuisScreen() {
  const { state, dispatch } = useGameContext();
  const { bab } = useLocalSearchParams<{ bab: keyof typeof AllQuizData }>();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // 1. Muat Soal & Mulai Kuis
  useEffect(() => {
    if (bab && AllQuizData[bab]) {
      const babQuestions = AllQuizData[bab].questions as QuizQuestion[];
      setQuestions(babQuestions);
      setAnswers(new Array(babQuestions.length).fill(null));

      // Kurangi energi & set cooldown
      dispatch({ type: "START_KUIS" });
      setQuizStarted(true); // Tandai kuis sudah dimulai
    } else {
      Alert.alert("Error", "Bab kuis tidak ditemukan.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [bab]);

  // 2. Tangani jika user keluar di tengah kuis
  useEffect(() => {
    interface NavigationEvent {
      preventDefault: () => void;
      // add optional fields if needed in the future
      [key: string]: unknown;
    }

    type RouterCallback = (e: NavigationEvent) => void;

    const listener: RouterCallback = (e) => {
      // Peringatkan user jika kuis sudah dimulai dan mereka mencoba kembali
      if (!quizStarted) return;

      e.preventDefault(); // Mencegah aksi default (keluar)

      Alert.alert(
        "Keluar Kuis?",
        "Energi akan tetap terpotong dan progres kuis ini akan hilang. Anda yakin?",
        [
          { text: "Batal", style: "cancel", onPress: () => {} },
          {
            text: "Ya, Keluar",
            style: "destructive",
            onPress: () => {
              setQuizStarted(false); // Matikan penjaga
              router.back(); // Keluar
            },
          },
        ]
      );
    };

    // Use the 'beforeRemove' listener and unsubscribe on cleanup.
    // cast to any to avoid strict typing issues with different router implementations
    const unsubscribe = (router as any).addListener?.("beforeRemove", listener);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [router, quizStarted]);

  // --- HANDLER NAVIGASI KUIS ---

  const handleSelectAnswer = (answer: Answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Simpan jawaban
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Pindah ke pertanyaan berikutnya
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); // Reset pilihan
    } else {
      // Kuis Selesai, hitung skor
      handleSubmitKuis(newAnswers);
    }
  };

  const handleSubmitKuis = (finalAnswers: Answer[]) => {
    let score = 0;
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        score++;
      }
    });

    // Kirim hasil ke Context
    dispatch({ type: "SUBMIT_KUIS", payload: { babId: bab, score } });

    // Tampilkan hasil
    Alert.alert(
      "Kuis Selesai!",
      `Skor Anda: ${score} / ${questions.length}\nAnda mendapat ${score} XP!`,
      [
        {
          text: "OK",
          onPress: () => {
            setQuizStarted(false); // Matikan penjaga
            router.back(); // Kembali ke halaman kelas
          },
        },
      ]
    );
  };

  // --- RENDER ---

  if (questions.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.quizHeader}>
        <Text style={styles.headerText}>Kuis {AllQuizData[bab].title}</Text>
        <Text style={styles.headerText}>
          Soal {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        {/* Tampilkan gambar jika ada (untuk B/S) */}
        {currentQuestion.image && (
          <Image
            source={require("@/assets/images/cula_character.png")} // GANTI DENGAN GAMBAR SOAL
            style={styles.questionImage}
          />
        )}
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.type === "BENAR_SALAH" && (
          <>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedAnswer === true && styles.optionSelected,
              ]}
              onPress={() => handleSelectAnswer(true)}
            >
              <Text style={styles.optionText}>Benar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedAnswer === false && styles.optionSelected,
              ]}
              onPress={() => handleSelectAnswer(false)}
            >
              <Text style={styles.optionText}>Salah</Text>
            </TouchableOpacity>
          </>
        )}

        {currentQuestion.type === "ABCD" &&
          currentQuestion.options?.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.optionSelected,
              ]}
              onPress={() => handleSelectAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          selectedAnswer === null && styles.disabledButton,
        ]}
        onPress={handleNextQuestion}
        disabled={selectedAnswer === null}
      >
        <Text style={styles.nextButtonText}>
          {currentQuestionIndex === questions.length - 1 ? "Selesai" : "Lanjut"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE", // Biru muda
    padding: 20,
    paddingTop:
      (Platform.OS === "android" ? Constants.statusBarHeight : 0) + 20,
  },
  quizHeader: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  questionImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  optionButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#8A2BE2",
  },
  optionSelected: {
    backgroundColor: "#D8BFD8", // Ungu muda
    borderColor: "#4B0082",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  nextButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderBottomWidth: 4,
    borderColor: "#4B0082",
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#AAA",
    borderColor: "#777",
    opacity: 0.7,
  },
});
