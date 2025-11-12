import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
// Impor semua tipe dari file baru
import {
  GameAction,
  GameContextProps,
  GameState,
  QuizAttempt,
} from "@/app/types/gameTypes";

// --- Konstanta ---
const STORAGE_KEY = "@CulawarnaGame:SaveData";
const REFILL_TIME_MS = 3 * 60 * 1000;
const XP_PER_LEVEL = 10;
const KUIS_ENERGY_COST = 25;

// --- STATE AWAL ---
const initialState: GameState = {
  xp: 0, // Mulai dari 0
  xpToNextLevel: XP_PER_LEVEL,
  phase: "Baby",
  koin: 15,
  energi: 100,
  maxEnergi: 100,
  currentOutfit: {
    bajuId: "baju-dasar",
    topiId: "topi-dasar",
    aksesorisId: null,
  },
  foodInventory: {
    "sate-bandeng": {
      id: "sate-bandeng",
      name: "Sate Bandeng",
      energyValue: 20,
      currentStacks: 1,
      maxStacks: 3,
      refillTimestamp: Date.now() - REFILL_TIME_MS,
      cost: 5,
    },
    "nasi-uduk": {
      id: "nasi-uduk",
      name: "Nasi Uduk",
      energyValue: 15,
      currentStacks: 0,
      maxStacks: 3,
      refillTimestamp: Date.now(),
      cost: 3,
    },
  },
  materiProgress: {
    bab1: { unlocked: true, completedQuiz: false },
    bab2: { unlocked: false, completedQuiz: false },
    bab3: { unlocked: false, completedQuiz: false },
    bab4: { unlocked: false, completedQuiz: false },
  },
  quizHistory: [],
  lastQuizTimestamp: 0,
  isLoading: true,
};

// --- REDUCER (Diperbarui) ---
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOAD_STATE":
      return { ...initialState, ...action.payload, isLoading: false };

    case "TAMBAH_XP": {
      let newXp = state.xp + action.payload;
      let newPhase = state.phase;
      let newProgress = state.materiProgress;

      // Cek Naik Level / Evolusi
      if (newXp >= state.xpToNextLevel) {
        newXp = newXp - state.xpToNextLevel; // Reset XP
        console.log("NAIK LEVEL!");

        // Logika Evolusi
        if (state.phase === "Baby") {
          newPhase = "Anak";
          newProgress = {
            ...newProgress,
            bab2: { ...newProgress.bab2, unlocked: true },
          };
          console.log("EVOLUSI KE ANAK!");
        } else if (state.phase === "Anak") {
          newPhase = "Remaja";
          newProgress = {
            ...newProgress,
            bab3: { ...newProgress.bab3, unlocked: true },
          };
          console.log("EVOLUSI KE REMAJA!");
        } else if (state.phase === "Remaja") {
          newPhase = "Dewasa";
          newProgress = {
            ...newProgress,
            bab4: { ...newProgress.bab4, unlocked: true },
          };
          console.log("EVOLUSI KE DEWASA!");
        }
      }
      return {
        ...state,
        xp: newXp,
        phase: newPhase,
        materiProgress: newProgress,
      };
    }

    case "GUNAKAN_ENERGI":
      return { ...state, energi: Math.max(0, state.energi - action.payload) };

    case "TAMBAH_ENERGI":
      return {
        ...state,
        energi: Math.min(state.maxEnergi, state.energi + action.payload),
      };

    case "TAMBAH_KOIN":
      return { ...state, koin: state.koin + action.payload };

    case "KURANGI_KOIN":
      return { ...state, koin: Math.max(0, state.koin - action.payload) };

    case "GANTI_OUTFIT":
      return {
        ...state,
        currentOutfit: {
          ...state.currentOutfit,
          [action.payload.itemType]: action.payload.itemId,
        },
      };

    case "KONSUMSI_MAKANAN": {
      // ... (logika sama seperti sebelumnya)
      const { foodId } = action.payload;
      const item = state.foodInventory[foodId];
      if (!item || item.currentStacks <= 0) return state;
      return {
        ...state,
        energi: Math.min(state.maxEnergi, state.energi + item.energyValue),
        foodInventory: {
          ...state.foodInventory,
          [foodId]: { ...item, currentStacks: item.currentStacks - 1 },
        },
      };
    }

    case "BELI_MAKANAN": {
      // ... (logika sama seperti sebelumnya)
      const { foodId } = action.payload;
      const item = state.foodInventory[foodId];
      if (
        !item ||
        state.koin < item.cost ||
        item.currentStacks >= item.maxStacks
      )
        return state;
      return {
        ...state,
        koin: state.koin - item.cost,
        foodInventory: {
          ...state.foodInventory,
          [foodId]: { ...item, currentStacks: item.currentStacks + 1 },
        },
      };
    }

    case "REFILL_MAKANAN": {
      // ... (logika sama seperti sebelumnya)
      const { foodId } = action.payload;
      const item = state.foodInventory[foodId];
      const now = Date.now();
      if (
        item &&
        item.currentStacks < item.maxStacks &&
        now - item.refillTimestamp >= REFILL_TIME_MS
      ) {
        return {
          ...state,
          foodInventory: {
            ...state.foodInventory,
            [foodId]: {
              ...item,
              currentStacks: item.currentStacks + 1,
              refillTimestamp: now,
            },
          },
        };
      }
      return state;
    }

    // --- LOGIKA KUIS BARU ---
    case "START_KUIS":
      // Pengecekan energi & cooldown dilakukan di halaman kuis
      // Di sini kita hanya potong energi & set timestamp
      return {
        ...state,
        energi: Math.max(0, state.energi - KUIS_ENERGY_COST),
        lastQuizTimestamp: Date.now(),
      };

    case "SUBMIT_KUIS": {
      const { babId, score } = action.payload;
      const newHistory: QuizAttempt = {
        babId,
        score,
        total: XP_PER_LEVEL,
        timestamp: Date.now(),
        passed: score === XP_PER_LEVEL,
      };

      return {
        ...state,
        // Tambahkan XP
        xp: state.xp + score,
        // Tandai kuis sudah selesai
        materiProgress: {
          ...state.materiProgress,
          [babId]: { ...state.materiProgress[babId], completedQuiz: true },
        },
        // Tambahkan ke riwayat
        quizHistory: [...state.quizHistory, newHistory],
      };
    }

    // Ini bisa dipanggil oleh TAMBAH_XP
    case "EVOLVE_CULA": {
      // (Logika ini sekarang ada di dalam TAMBAH_XP)
      return state;
    }

    default:
      return state;
  }
};

// --- 4. CREATE CONTEXT ---
const GameContext = createContext<GameContextProps | undefined>(undefined);

// --- 5. PROVIDER COMPONENT ---
export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(savedState) });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (e) {
        console.error("Gagal memuat data:", e);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      const saveState = async () => {
        try {
          const jsonState = JSON.stringify(state);
          await AsyncStorage.setItem(STORAGE_KEY, jsonState);
        } catch (e) {
          console.error("Gagal menyimpan data:", e);
        }
      };
      saveState();
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- 6. CUSTOM HOOK ---
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext harus digunakan di dalam GameProvider");
  }
  return context;
};
