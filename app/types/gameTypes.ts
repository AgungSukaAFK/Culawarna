// Di dalam file: app/types/gameTypes.ts
// (PERBARUI FILE ANDA)

import { ReactNode } from "react";
import { ImageSourcePropType } from "react-native";

// Tipe Status Cula
export type CulaPhase = "Baby" | "Anak" | "Remaja" | "Dewasa";

export interface Outfit {
  bajuId: string | null;
  topiId: string | null;
  aksesorisId: string | null;
}

// Tipe Makanan
export interface FoodItem {
  id: string;
  name: string;
  energyValue: number;
  currentStacks: number;
  maxStacks: number;
  cost: number;

  // Logika Masak
  cookingStartTime: number; // 0 jika sedang tidak dimasak
  isCooking: boolean; // True jika sedang di kompor
  cookDuration: number; // Lama masak dalam ms
}

// Tipe Materi & Kuis
export interface QuizQuestion {
  type: "BENAR_SALAH" | "ABCD";
  image?: string; // Nama file gambar di assets
  questionText: string;
  options?: string[]; // Untuk ABCD
  correctAnswer: string | boolean;
}

export interface QuizChapter {
  id: string; // "bab1", "bab2", ...
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  babId: string;
  score: number; // Jumlah benar
  total: number; // Selalu 10
  timestamp: number;
  passed: boolean;
}

export interface MateriProgress {
  [materiId: string]: {
    unlocked: boolean;
    completedQuiz: boolean;
  };
}

export type AppearanceMode = "Default" | CulaPhase;

export interface GameHUDLayoutProps {
  children: ReactNode;
  backgroundImage: ImageSourcePropType;
  middleNavButton: NavButtonProps;
  pageModal: ReactNode;
  onPressNavLeft: () => void;
  onPressNavRight: () => void;
  helpContent?: HelpContent;
}

export interface HelpContent {
  title: string;
  body: string | ReactNode; // <-- Ubah jadi ini agar fleksibel
}

// Tipe State Utama
export interface GameState {
  phase: CulaPhase;
  xp: number;
  xpToNextLevel: number;
  selectedAppearance: AppearanceMode;
  koin: number;
  energi: number;
  maxEnergi: number;
  currentOutfit: Outfit;
  foodInventory: { [foodId: string]: FoodItem };
  materiProgress: MateriProgress;
  quizHistory: QuizAttempt[];
  lastQuizTimestamp: number;
  isLoading: boolean;
  volume: number;
  isMinigameActive: boolean;

  // --- TAMBAHAN UNTUK TOKO & INVENTORY ---
  ownedBaju: string[];
  ownedTopi: string[];
  ownedAksesoris: string[];
  // ----------------------------------------
}

// Tipe Aksi
export type GameAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_STATE"; payload: Partial<GameState> }
  | { type: "TAMBAH_XP"; payload: number }
  | { type: "GUNAKAN_ENERGI"; payload: number }
  | { type: "TAMBAH_ENERGI"; payload: number }
  | { type: "TAMBAH_KOIN"; payload: number }
  | { type: "KURANGI_KOIN"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_APPEARANCE"; payload: AppearanceMode }
  | {
      type: "GANTI_OUTFIT";
      payload: { itemType: keyof Outfit; itemId: string | null }; // Izinkan null
    }
  | { type: "EVOLUSI"; payload: { newPhase: CulaPhase; nextLevelXp: number } }
  | { type: "KONSUMSI_MAKANAN"; payload: { foodId: string } }
  | { type: "BELI_MAKANAN"; payload: { foodId: string } }
  | { type: "REFILL_MAKANAN"; payload: { foodId: string } }
  | { type: "START_KUIS" }
  | { type: "SUBMIT_KUIS"; payload: { babId: string; score: number } }
  | { type: "EVOLVE_CULA"; payload: { newPhase: CulaPhase } }
  | { type: "SET_MINIGAME_ACTIVE"; payload: boolean }
  // --- TAMBAHAN UNTUK TOKO & INVENTORY ---
  | { type: "BELI_ITEM"; payload: { itemId: string; itemType: keyof Outfit } }
  | { type: "MULAI_MASAK"; payload: { foodId: string } }
  | { type: "AMBIL_MASAKAN"; payload: { foodId: string } };
// ----------------------------------------

export interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// ... (Sisa props komponen tetap sama) ...
export interface NavButtonProps {
  onPress: () => void;
  icon: ReactNode;
  text: string;
}

export interface ModalPengaturanProps {
  visible: boolean;
  onClose: () => void;
  onExit: () => void;
  volume: number;
  setVolume: (vol: number) => void;

  // Props Baru untuk Tampilan
  selectedAppearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;

  // Debug props (biarkan jika masih ada)
  onGunakanEnergi?: () => void;
  onTambahEnergi?: () => void;
  onDapatKoin?: () => void;
  onDapatXP?: () => void;
}

export interface ModalNavigasiProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export interface ModalLemariProps {
  visible: boolean;
  onClose: () => void;
  // Hapus onGantiBaju, modal akan handle sendiri
}
