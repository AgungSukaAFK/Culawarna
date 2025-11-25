// Di dalam file: app/kuis/[bab].tsx

import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import quizData from "@/app/data/quizData.json";
import { QuizImages } from "@/app/utils/quizAssets"; // <-- Import Mapping Aset Baru
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type QuizDataKeys = keyof typeof quizData;

export default function KuisScreen() {
  const { bab } = useLocalSearchParams<{ bab: string }>();
  const router = useRouter();
  const { dispatch } = useGameContext();

  // --- STATE ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // State Password
  const [isLocked, setIsLocked] = useState(true);
  const [inputPassword, setInputPassword] = useState("");

  // Load Data
  const babKey = bab as QuizDataKeys;
  const selectedBab = bab && quizData[babKey] ? quizData[babKey] : null;

  if (!selectedBab) {
    return (
      <View style={styles.centerContainer}>
        <Text>Data kuis tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "blue", marginTop: 10 }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- LOGIKA PASSWORD ---
  const handleCheckPassword = () => {
    const correctPassword = (selectedBab as any).password || "123";
    if (inputPassword.toUpperCase() === correctPassword.toUpperCase()) {
      setIsLocked(false);
    } else {
      Alert.alert(
        "Password Salah",
        "Silakan tanya gurumu untuk password yang benar!"
      );
      setInputPassword("");
    }
  };

  const handleCancelPassword = () => {
    router.back();
  };

  // --- LOGIKA JAWAB ---
  const handleAnswer = (isCorrect: boolean) => {
    let point = 0;
    if (isCorrect) {
      point = 1;
      setScore(score + 1);
    }

    Alert.alert(
      isCorrect ? "Benar! 🎉" : "Kurang Tepat 😅",
      isCorrect ? "Jawabanmu tepat." : "Jangan menyerah!",
      [{ text: "Lanjut", onPress: () => nextQuestion() }]
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedBab.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    dispatch({
      type: "SUBMIT_KUIS",
      payload: {
        babId: selectedBab.id,
        score: score,
      },
    });
  };

  const currentQuestion = selectedBab.questions[currentQuestionIndex];

  // --- LOGIKA GAMBAR SOAL ---
  // Cek apakah ada properti 'image' di JSON dan apakah ada di mapping QuizImages
  const questionImageSource =
    "image" in currentQuestion && currentQuestion.image
      ? (QuizImages as any)[currentQuestion.image]
      : null;

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kelas_bg.png")}
      onPressNavLeft={() => router.back()}
      onPressNavRight={() => {}}
      middleNavButton={{
        onPress: () => {},
        icon: <Ionicons name="school" size={24} color="white" />,
        text: "Kuis",
      }}
      pageModal={null}
    >
      {/* --- MODAL PASSWORD --- */}
      <Modal
        visible={isLocked}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPassword}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordTitle}>🔒 Kuis Terkunci</Text>
            <Text style={styles.passwordSubtitle}>
              Masukkan password dari gurumu untuk memulai kuis "
              {selectedBab.title}".
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password..."
              placeholderTextColor="#888"
              value={inputPassword}
              onChangeText={setInputPassword}
              secureTextEntry={false}
              autoCapitalize="characters"
            />
            <View style={styles.passwordButtonRow}>
              <TouchableOpacity
                style={[styles.passwordButton, styles.btnCancel]}
                onPress={handleCancelPassword}
              >
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordButton, styles.btnConfirm]}
                onPress={handleCheckPassword}
              >
                <Text style={styles.btnText}>Mulai</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* --- KONTEN KUIS --- */}
      {!isLocked && (
        <View style={styles.quizContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.questionCounter}>
              Soal {currentQuestionIndex + 1} / {selectedBab.questions.length}
            </Text>
            <Text style={styles.scoreText}>Benar: {score}</Text>
          </View>

          {/* KARTU PERTANYAAN */}
          <View style={styles.questionCard}>
            {/* Tampilkan Gambar Soal Jika Ada */}
            {questionImageSource ? (
              <Image
                source={questionImageSource}
                style={styles.questionImage}
                resizeMode="contain"
              />
            ) : (
              // Jika tidak ada gambar soal, tampilkan Si Cula (opsional)
              <CulaCharacter style={styles.hostImage} />
            )}

            <Text style={styles.questionText}>
              {currentQuestion.questionText}
            </Text>
          </View>

          {/* Opsi Jawaban */}
          <View style={styles.optionsContainer}>
            {currentQuestion.type === "BENAR_SALAH" && (
              <View style={styles.benarSalahRow}>
                <TouchableOpacity
                  style={[styles.optionButton, styles.benarButton]}
                  onPress={() =>
                    handleAnswer(currentQuestion.correctAnswer === true)
                  }
                >
                  <Text style={styles.optionText}>BENAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.salahButton]}
                  onPress={() =>
                    handleAnswer(currentQuestion.correctAnswer === false)
                  }
                >
                  <Text style={styles.optionText}>SALAH</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentQuestion.type === "ABCD" &&
              currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() =>
                    handleAnswer(option === currentQuestion.correctAnswer)
                  }
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

      {/* --- MODAL HASIL --- */}
      <Modal visible={isFinished} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Kuis Selesai!</Text>
            <Text style={styles.resultSubtitle}>
              Kamu menjawab {score} dari {selectedBab.questions.length} soal
              dengan benar.
            </Text>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => {
                setIsFinished(false);
                router.replace("/kelas");
              }}
            >
              <Text style={styles.finishButtonText}>Kembali ke Kelas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quizContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#4A2A00",
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    minHeight: 150,
    borderWidth: 4,
    borderColor: "#4A2A00",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Style Baru untuk Gambar Soal
  questionImage: {
    width: "100%",
    height: 200, // Tinggi fix agar rapi
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#f0f0f0", // Placeholder color saat loading
  },
  hostImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    textAlign: "center",
    color: "#4A2A00",
    fontWeight: "bold",
    lineHeight: 24,
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#FFB347",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4A2A00",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  // Layout khusus Benar/Salah
  benarSalahRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  benarButton: {
    flex: 1,
    backgroundColor: "#4ECDC4", // Hijau Tosca
    borderColor: "#00796B",
  },
  salahButton: {
    flex: 1,
    backgroundColor: "#FF6B6B", // Merah Muda
    borderColor: "#B71C1C",
  },
  optionText: {
    fontSize: 16,
    color: "#4A2A00", // Ubah ke Putih jika background gelap
    fontWeight: "bold",
  },
  // ... (Styles Password & Result sama seperti sebelumnya)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#FFF8E7",
    padding: 30,
    borderRadius: 25,
    alignItems: "center",
    elevation: 10,
    width: "85%",
    borderWidth: 5,
    borderColor: "#4A2A00",
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4A2A00",
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  finishButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#4B0082",
  },
  finishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordContainer: {
    width: "85%",
    backgroundColor: "#FFF8E7",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#8B4513",
    elevation: 10,
  },
  passwordTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 10,
  },
  passwordSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  passwordInput: {
    width: "100%",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#CCC",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  passwordButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  passwordButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    borderBottomWidth: 3,
  },
  btnCancel: {
    backgroundColor: "#FF6B6B",
    borderColor: "#B71C1C",
  },
  btnConfirm: {
    backgroundColor: "#4ECDC4",
    borderColor: "#00796B",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
