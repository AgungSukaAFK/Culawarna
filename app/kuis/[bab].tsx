// Di dalam file: app/kuis/[bab].tsx
// (KODE LENGKAP - GANTI SELURUH FILE ANDA DENGAN INI)

import { useGameContext } from "@/app/context/GameContext";
import { QuizQuestion } from "@/app/types/gameTypes"; // Hapus CulaPhase
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AllQuizData from "@/app/data/quizData.json";
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

  // (useEffect untuk Muat Soal tetap sama)
  useEffect(() => {
    if (bab && AllQuizData[bab]) {
      const babQuestions = AllQuizData[bab].questions as QuizQuestion[];
      if (babQuestions.length === 0) {
        Alert.alert("Segera Hadir", "Kuis untuk bab ini belum tersedia.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      setQuestions(babQuestions);
      setAnswers(new Array(babQuestions.length).fill(null));

      dispatch({ type: "START_KUIS" });
      setQuizStarted(true);
    } else {
      if (!bab) {
        Alert.alert("Error", "Bab kuis tidak ditemukan (ID Bab kosong).", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [bab]);

  // (useEffect untuk 'beforeRemove' tetap sama)
  useEffect(() => {
    if (Platform.OS === "web") return;
    interface NavigationEvent {
      preventDefault: () => void;
      [key: string]: unknown;
    }
    type RouterCallback = (e: NavigationEvent) => void;
    const listener: RouterCallback = (e) => {
      if (!quizStarted) return;
      e.preventDefault();
      Alert.alert(
        "Keluar Kuis?",
        "Energi akan tetap terpotong dan progres kuis ini akan hilang. Anda yakin?",
        [
          { text: "Batal", style: "cancel", onPress: () => {} },
          {
            text: "Ya, Keluar",
            style: "destructive",
            onPress: () => {
              setQuizStarted(false);
              router.back();
            },
          },
        ]
      );
    };
    const unsubscribe = (router as any).addListener?.("beforeRemove", listener);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [router, quizStarted]);

  // (handleSelectAnswer tetap sama)
  const handleSelectAnswer = (answer: Answer) => {
    setSelectedAnswer(answer);
  };

  // (handleNextQuestion tetap sama)
  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitKuis(newAnswers);
    }
  };

  // --- PERBAIKAN UTAMA DI FUNGSI INI ---
  const handleSubmitKuis = (finalAnswers: Answer[]) => {
    // Guard clause (Tetap dipertahankan, ini bagus)
    if (typeof bab !== "string" || !AllQuizData[bab]) {
      Alert.alert("Error Kritis", "Gagal menyimpan kuis: ID Bab tidak valid.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    let score = 0;
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        score++;
      }
    });

    // Kirim hasil ke Context. Context yang akan mengurus logika 0 XP.
    dispatch({ type: "SUBMIT_KUIS", payload: { babId: bab, score } });

    // --- LOGIKA 0 XP DIHAPUS DARI SINI ---
    // (Objek babPhaseMap dan phaseOrder dihapus)

    // Langsung tampilkan Alert.
    // Pesan XP kita sederhanakan, karena kita tidak tahu
    // berapa XP yang didapat (Context yang tahu).
    Alert.alert(
      "Kuis Selesai!",
      `Skor Anda: ${score} / ${questions.length}`, // Pesan disederhanakan
      [
        {
          text: "OK",
          onPress: () => {
            setQuizStarted(false);
            router.back();
          },
        },
      ]
    );
  };

  // --- RENDER (Tetap sama) ---
  if (questions.length === 0) {
    return bab ? (
      <ActivityIndicator style={{ flex: 1, backgroundColor: "#E6F4FE" }} />
    ) : null;
  }
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.quizHeader}>
        <Text style={styles.headerText}>Kuis {AllQuizData[bab].title}</Text>
        <Text style={styles.headerText}>
          Soal {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionContainer}>
          {currentQuestion.image && (
            <Image
              source={require("@/assets/images/cula_character.png")}
              style={styles.questionImage}
            />
          )}
          <Text style={styles.questionText}>
            {currentQuestion.questionText}
          </Text>
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.disabledButton,
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1
              ? "Selesai"
              : "Lanjut"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES (Tidak berubah) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
  },
  quizHeader: {
    padding: 20,
    paddingTop: Platform.OS === "web" ? 20 : 0,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 150,
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
    justifyContent: "center",
  },
  optionButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#8A2BE2",
    cursor: "pointer",
  },
  optionSelected: {
    backgroundColor: "#D8BFD8",
    borderColor: "#4B0082",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
  },
  nextButton: {
    backgroundColor: "#8A2BE2",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderBottomWidth: 4,
    borderColor: "#4B0082",
    cursor: "pointer",
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
