// Di dalam file: app/kuis/[bab].tsx

import { useSFX } from "@/app/_layout"; // Import Hook SFX
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import quizData from "@/app/data/quizData.json";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- ASET EKSPRESI ---
// Pastikan file ini ada di folder assets Anda
const CULA_HAPPY = require("@/assets/images/chars/expression/happy.png");
const CULA_SAD = require("@/assets/images/chars/expression/sad.png");

type QuizDataKeys = keyof typeof quizData;

// --- KOMPONEN MODAL HASIL JAWABAN (POPUP) ---
interface ModalResultProps {
  visible: boolean;
  isCorrect: boolean;
  correctAnswerText: string;
  explanation?: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

const ModalResult: React.FC<ModalResultProps> = ({
  visible,
  isCorrect,
  correctAnswerText,
  explanation,
  onNext,
  isLastQuestion,
}) => {
  const { playSfx, playBtnSound } = useSFX();

  // Efek Suara saat modal muncul
  useEffect(() => {
    if (visible) {
      if (isCorrect) {
        playSfx("quiz_correct");
      } else {
        playSfx("quiz_wrong");
      }
    }
  }, [visible, isCorrect]);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <BlurView intensity={20} tint={Platform.OS === 'web' ? 'light' : 'dark'} style={styles.modalOverlay}>
        <View style={styles.resultContainer}>
          
          {/* GAMBAR EKSPRESI */}
          <Image
            source={isCorrect ? CULA_HAPPY : CULA_SAD}
            style={styles.expressionImage}
            resizeMode="contain"
          />

          {/* TEXT JUDUL */}
          <Text style={[styles.resultTitle, isCorrect ? styles.textCorrect : styles.textWrong]}>
            {isCorrect ? "Jawaban Benar! 🎉" : "Yah, Kurang Tepat... 😢"}
          </Text>

          {/* KONTEN KOREKSI (JIKA SALAH) */}
          <ScrollView style={styles.scrollContent}>
            {!isCorrect && (
              <View style={styles.correctionBox}>
                <Text style={styles.correctionLabel}>Jawaban yang benar:</Text>
                <Text style={styles.correctionText}>{correctAnswerText}</Text>
              </View>
            )}

            {/* PEMBAHASAN (OPSIONAL) */}
            {explanation ? (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>Pembahasan:</Text>
                <Text style={styles.explanationText}>{explanation}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* TOMBOL LANJUT */}
          <TouchableOpacity
            style={[styles.modalButton, styles.nextButton]}
            onPress={() => {
              playBtnSound();
              onNext();
            }}
          >
            <Text style={styles.modalButtonText}>
              {isLastQuestion ? "Lihat Skor Akhir" : "Soal Selanjutnya"}
            </Text>
            <Ionicons name={isLastQuestion ? "trophy" : "arrow-forward"} size={20} color="white" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- LAYAR KUIS UTAMA ---
export default function KuisScreen() {
  const { bab } = useLocalSearchParams<{ bab: string }>();
  const router = useRouter();
  const { dispatch } = useGameContext();
  const { playSfx, playBtnSound } = useSFX();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // State untuk Modal Result (Per Soal)
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  
  // State untuk Modal Finish (Akhir)
  const [isFinished, setIsFinished] = useState(false);
  
  // State Password
  const [isLocked, setIsLocked] = useState(true);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const currentQuestion = selectedBab.questions[currentQuestionIndex];

  // --- LOGIKA PASSWORD ---
  const handleCheckPassword = () => {
    const correctPassword = (selectedBab as any).password || "123";
    if (inputPassword.toUpperCase() === correctPassword.toUpperCase()) {
      playSfx("tap");
      setIsLocked(false);
    } else {
      playSfx("quiz_wrong");
      setPasswordError("Password salah, coba tanya gurumu!");
    }
  };

  // --- LOGIKA JAWAB SOAL ---
  const handleAnswer = (userAnswer: string | boolean) => {
    // Cek Jawaban
    let isCorrect = false;
    
    if (currentQuestion.type === "BENAR_SALAH") {
      // Konversi boolean ke string "true"/"false" jika perlu sesuai JSON
      const strAnswer = String(userAnswer); 
      isCorrect = strAnswer === currentQuestion.correctAnswer;
    } else {
      // Tipe ABCD
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Set state untuk modal result
    setLastAnswerCorrect(isCorrect);
    setResultModalVisible(true);
  };

  // --- LOGIKA NEXT / FINISH ---
  const handleNextStep = () => {
    setResultModalVisible(false); // Tutup modal result

    if (currentQuestionIndex < selectedBab.questions.length - 1) {
      // Lanjut soal berikutnya
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finish
      setTimeout(() => {
        playSfx("quiz_done");
        setIsFinished(true);
      }, 500);
    }
  };

  const handleFinalizeAndExit = () => {
    playBtnSound();
    dispatch({
      type: "SUBMIT_KUIS",
      payload: {
        babId: selectedBab.id,
        score: score,
      },
    });
    setIsFinished(false);
    router.replace("/kelas");
  };

  // Helper untuk mendapatkan text jawaban benar (untuk ditampilkan saat salah)
  const getCorrectAnswerText = (): string => {
    if (currentQuestion.type === "BENAR_SALAH") {
      return currentQuestion.correctAnswer === "true" ? "BENAR" : "SALAH";
    }
    return String(currentQuestion.correctAnswer);
  };

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kelas_bg.png")}
      onPressNavLeft={() => {
        playBtnSound();
        router.back();
      }}
      onPressNavRight={() => {}}
      middleNavButton={{
        onPress: () => {},
        icon: <Ionicons name="school" size={24} color="white" />,
        text: "Kuis",
      }}
      pageModal={null}
    >
      {/* --- MODAL PASSWORD --- */}
      <Modal visible={isLocked} transparent={true} animationType="fade">
        <BlurView intensity={20} tint={Platform.OS === 'web' ? 'light' : 'dark'} style={styles.modalOverlay}>
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordTitle}>🔒 Kuis Terkunci</Text>
            <Text style={styles.passwordSubtitle}>
              Masukkan password dari gurumu untuk memulai kuis "{selectedBab.title}".
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="Password..."
              placeholderTextColor="#888"
              value={inputPassword}
              onChangeText={(t) => {
                setInputPassword(t);
                setPasswordError("");
              }}
              autoCapitalize="characters"
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <View style={styles.passwordButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  playBtnSound();
                  router.back();
                }}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCheckPassword}
              >
                <Text style={styles.modalButtonText}>Mulai</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* --- MODAL HASIL JAWABAN (POPUP EKSPRESI) --- */}
      <ModalResult
        visible={resultModalVisible}
        isCorrect={lastAnswerCorrect}
        correctAnswerText={getCorrectAnswerText()}
        explanation={(currentQuestion as any).explanation} // Asumsi ada field explanation di JSON (opsional)
        onNext={handleNextStep}
        isLastQuestion={currentQuestionIndex === selectedBab.questions.length - 1}
      />

      {/* --- KONTEN KUIS --- */}
      {!isLocked && !isFinished && (
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
            <CulaCharacter style={styles.hostImage} />
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
                  onPress={() => handleAnswer(true)}
                >
                  <Text style={styles.optionText}>BENAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.salahButton]}
                  onPress={() => handleAnswer(false)}
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
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

      {/* --- MODAL SKOR AKHIR --- */}
      <Modal visible={isFinished} transparent={true} animationType="slide">
        <BlurView intensity={20} tint={Platform.OS === 'web' ? 'light' : 'dark'} style={styles.modalOverlay}>
          <View style={styles.finishCard}>
            <Text style={styles.finishTitle}>Kuis Selesai!</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{Math.round((score / selectedBab.questions.length) * 100)}</Text>
              <Text style={styles.scoreLabel}>Nilai</Text>
            </View>

            <Text style={styles.finishSubtitle}>
              Kamu menjawab {score} dari {selectedBab.questions.length} soal dengan benar.
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.finishButton]}
              onPress={handleFinalizeAndExit}
            >
              <Text style={styles.modalButtonText}>Kembali ke Kelas</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  
  // --- STYLE MODAL RESULT (EKSPRESI) ---
  resultContainer: { width: "85%", maxWidth: 400, maxHeight: "80%", backgroundColor: "#FFF8E7", borderRadius: 25, padding: 25, alignItems: "center", borderWidth: 5, borderColor: "#4A2A00", elevation: 10 },
  expressionImage: { width: 150, height: 150, marginBottom: 15 },
  resultTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  textCorrect: { color: "#27AE60" },
  textWrong: { color: "#C0392B" },
  scrollContent: { width: "100%", maxHeight: 200, marginBottom: 20 },
  correctionBox: { backgroundColor: "#FFCDD2", padding: 10, borderRadius: 10, marginBottom: 10, width: "100%" },
  correctionLabel: { fontWeight: "bold", color: "#C0392B", marginBottom: 2 },
  correctionText: { color: "#333", fontSize: 16 },
  explanationBox: { backgroundColor: "#E8F6F3", padding: 10, borderRadius: 10, width: "100%" },
  explanationLabel: { fontWeight: "bold", color: "#16A085", marginBottom: 2 },
  explanationText: { color: "#333", fontSize: 14, lineHeight: 20 },
  nextButton: { backgroundColor: "#3498DB", borderColor: "#2980B9", width: "100%" },

  // --- STYLE KUIS ---
  quizContainer: { flex: 1, padding: 20, justifyContent: "center", paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, backgroundColor: "rgba(255,255,255,0.9)", padding: 15, borderRadius: 15, borderWidth: 2, borderColor: "#4A2A00" },
  questionCounter: { fontSize: 16, fontWeight: "bold", color: "#4A2A00" },
  scoreText: { fontSize: 16, fontWeight: "bold", color: "#27AE60" },
  questionCard: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 20, marginBottom: 20, alignItems: "center", minHeight: 150, borderWidth: 4, borderColor: "#4A2A00", elevation: 5 },
  hostImage: { width: 80, height: 80, marginBottom: 10 },
  questionText: { fontSize: 18, textAlign: "center", color: "#4A2A00", fontWeight: "bold", lineHeight: 26 },
  
  optionsContainer: { width: "100%" },
  optionButton: { backgroundColor: "#FFB347", padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 3, borderColor: "#E67E22", alignItems: "center", elevation: 3 },
  optionText: { fontSize: 16, color: "#4A2A00", fontWeight: "bold" },
  
  benarSalahRow: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  benarButton: { flex: 1, backgroundColor: "#2ECC71", borderColor: "#27AE60" },
  salahButton: { flex: 1, backgroundColor: "#E74C3C", borderColor: "#C0392B" },

  // --- STYLE PASSWORD ---
  passwordContainer: { width: "85%", backgroundColor: "#FFF8E7", borderRadius: 20, padding: 25, alignItems: "center", borderWidth: 4, borderColor: "#8B4513" },
  passwordTitle: { fontSize: 22, fontWeight: "bold", color: "#8B4513", marginBottom: 10 },
  passwordSubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
  passwordInput: { width: "100%", backgroundColor: "white", borderWidth: 2, borderColor: "#CCC", borderRadius: 10, padding: 12, fontSize: 18, textAlign: "center", marginBottom: 10, fontWeight: "bold", color: "#333" },
  errorText: { color: "red", marginBottom: 10, fontSize: 12, fontWeight: "bold" },
  passwordButtonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 10 },
  cancelButton: { flex: 1, backgroundColor: "#95A5A6", borderColor: "#7F8C8D" },
  confirmButton: { flex: 1, backgroundColor: "#2ECC71", borderColor: "#27AE60" },

  // --- STYLE FINISH ---
  finishCard: { backgroundColor: "#FFF8E7", padding: 30, borderRadius: 25, alignItems: "center", elevation: 10, width: "85%", borderWidth: 5, borderColor: "#4A2A00" },
  finishTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#4A2A00" },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#2ECC71", justifyContent: "center", alignItems: "center", borderWidth: 5, borderColor: "#27AE60", marginBottom: 20 },
  scoreNumber: { fontSize: 40, fontWeight: "bold", color: "white" },
  scoreLabel: { fontSize: 14, color: "white", fontWeight: "bold" },
  finishSubtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 25 },
  finishButton: { backgroundColor: "#8A2BE2", borderColor: "#4B0082", width: "100%" },

  // --- SHARED BUTTON STYLES ---
  modalButton: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 15, alignItems: "center", justifyContent: "center", borderBottomWidth: 4 },
  modalButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});