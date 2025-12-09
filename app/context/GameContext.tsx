// Di dalam file: app/context/GameContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
// Impor tipe
import {
  CulaPhase,
  GameAction,
  GameContextProps,
  GameState,
  QuizAttempt,
} from "@/app/types/gameTypes";

// --- Konstanta ---
const STORAGE_KEY = "@CulawarnaGame:SaveData_V7"; // Ganti version biar fresh
const COOK_TIME_MS = 3 * 60 * 1000;
const XP_PER_LEVEL = 10; // XP yang dibutuhkan untuk naik level
const KUIS_ENERGY_COST = 25;

// --- HELPER: Mapping Bab ke Fase ---
const babPhaseMap: { [key: string]: CulaPhase } = {
  bab1: "Baby",
  bab2: "Anak",
  bab3: "Remaja",
  bab4: "Dewasa",
};

// --- HELPER: Urutan Fase (untuk perbandingan) ---
const phaseOrder: { [key in CulaPhase]: number } = {
  Baby: 1,
  Anak: 2,
  Remaja: 3,
  Dewasa: 4,
};

// --- STATE AWAL ---
const initialState: GameState = {
  xp: 0,
  level: 1,
  xpToNextLevel: XP_PER_LEVEL,
  koin: 15,
  energi: 100,
  maxEnergi: 100,
  volume: 0.7,    // Default BGM
  sfxVolume: 1.0, // Default SFX (Full)
  phase: "Baby",
  selectedAppearance: "Default",
  currentOutfit: {
    bajuId: null,
    topiId: null,
    aksesorisId: null,
  },
  // Inventory Makanan (Sesuai update sebelumnya)
  foodInventory: {
    mutiara: {
      id: "mutiara",
      name: "Bubur Mutiara",
      energyValue: 15,
      currentStacks: 2,
      maxStacks: 5,
      cost: 5,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    kue: {
      id: "kue",
      name: "Kue Balok",
      energyValue: 20,
      currentStacks: 0,
      maxStacks: 5,
      cost: 8,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    gipang: {
      id: "gipang",
      name: "Gipang Kacang",
      energyValue: 25,
      currentStacks: 0,
      maxStacks: 5,
      cost: 10,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    bugis: {
      id: "bugis",
      name: "Kue Bugis",
      energyValue: 30,
      currentStacks: 0,
      maxStacks: 5,
      cost: 12,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    bintul: {
      id: "bintul",
      name: "Ketan Bintul",
      energyValue: 40,
      currentStacks: 0,
      maxStacks: 5,
      cost: 15,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    emping: {
      id: "emping",
      name: "Emping Melinjo",
      energyValue: 35,
      currentStacks: 0,
      maxStacks: 5,
      cost: 15,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 10000,
    },
    rabeg: {
      id: "rabeg",
      name: "Rabeg Banten",
      energyValue: 60,
      currentStacks: 0,
      maxStacks: 3,
      cost: 25,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 20000,
    },
    pecakbandeng: {
      id: "pecakbandeng",
      name: "Pecak Bandeng",
      energyValue: 80,
      currentStacks: 0,
      maxStacks: 3,
      cost: 30,
      cookingStartTime: 0,
      isCooking: false,
      cookDuration: 20000,
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
  isMinigameActive: false,
  ownedBaju: [],
  ownedTopi: [],
  ownedAksesoris: [],
};

// --- REDUCER ---
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "CHEAT_SET_PHASE": {
      const targetPhase = action.payload;
      let newLevel = state.level;
      let newXp = state.xp;

      // Sesuaikan level minimal agar logis dengan fase barunya
      // (Supaya kuisnya kebuka juga)
      if (targetPhase === "Baby") { newLevel = 1; }
      if (targetPhase === "Anak") { newLevel = Math.max(state.level, 2); }
      if (targetPhase === "Remaja") { newLevel = Math.max(state.level, 5); }
      if (targetPhase === "Dewasa") { newLevel = Math.max(state.level, 10); }

      return {
        ...state,
        phase: targetPhase,
        level: newLevel,
        selectedAppearance: "Default", // Reset tampilan ke default fase baru
      };
    }

    case "CHEAT_MODIFY_KOIN":
      return { 
        ...state, 
        koin: Math.max(0, state.koin + action.payload) 
      };

    case "CHEAT_MODIFY_ENERGI":
      return { 
        ...state, 
        energi: Math.max(0, Math.min(state.maxEnergi, state.energi + action.payload)) 
      };

    // --- LOGIKA GAME STANDAR (Tetap sama, pastikan copy semua) ---
    case "SET_VOLUME": return { ...state, volume: action.payload };
    case "SET_SFX_VOLUME": return { ...state, sfxVolume: action.payload };
    case "SET_APPEARANCE": return { ...state, selectedAppearance: action.payload };
    
    case "TAMBAH_XP": {
      const newXp = state.xp + action.payload;
      let newLevel = state.level;
      let newPhase = state.phase;
      
      // Logic Naik Level sederhana
      if (newXp >= state.xpToNextLevel) {
        newLevel += 1;
      }

      // Logic Evolusi Otomatis berdasarkan Level
      if (newLevel >= 10) newPhase = "Dewasa";
      else if (newLevel >= 5) newPhase = "Remaja";
      else if (newLevel >= 2) newPhase = "Anak";

      return { ...state, xp: newXp, level: newLevel, phase: newPhase };
    }

    case "TAMBAH_KOIN": return { ...state, koin: state.koin + action.payload };
    case "KURANGI_KOIN": return { ...state, koin: Math.max(0, state.koin - action.payload) };
    case "GUNAKAN_ENERGI": return { ...state, energi: Math.max(0, state.energi - action.payload) };
    case "TAMBAH_ENERGI": return { ...state, energi: Math.min(state.maxEnergi, state.energi + action.payload) };
    case "SET_SFX_VOLUME":
      return { ...state, sfxVolume: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "LOAD_STATE":
      return { ...initialState, ...action.payload, isLoading: false };
    case "GUNAKAN_ENERGI":
      return { ...state, energi: Math.max(0, state.energi - action.payload) };

    case "GANTI_OUTFIT":
      return {
        ...state,
        currentOutfit: {
          ...state.currentOutfit,
          [action.payload.itemType]: action.payload.itemId,
        },
      };

    // --- LOGIKA MAKANAN ---
    case "KONSUMSI_MAKANAN": {
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
    case "MULAI_MASAK": {
      const { foodId } = action.payload;
      const item = state.foodInventory[foodId];
      const cookingCount = Object.values(state.foodInventory).filter(
        (f) => f.isCooking
      ).length;
      if (
        cookingCount >= 2 ||
        item.currentStacks >= item.maxStacks ||
        item.isCooking
      )
        return state;
      return {
        ...state,
        foodInventory: {
          ...state.foodInventory,
          [foodId]: { ...item, isCooking: true, cookingStartTime: Date.now() },
        },
      };
    }
    case "AMBIL_MASAKAN": {
      const { foodId } = action.payload;
      const item = state.foodInventory[foodId];
      if (!item.isCooking) return state;
      return {
        ...state,
        foodInventory: {
          ...state.foodInventory,
          [foodId]: {
            ...item,
            isCooking: false,
            cookingStartTime: 0,
            currentStacks: item.currentStacks + 1,
          },
        },
      };
    }

    case "START_KUIS":
      return {
        ...state,
        energi: Math.max(0, state.energi - KUIS_ENERGY_COST),
        lastQuizTimestamp: Date.now(),
      };

    // --- REVISI LOGIKA SUBMIT KUIS (ANTI-FARMING) ---
    case "SUBMIT_KUIS": {
      const { babId, score } = action.payload;

      // 1. Simpan History
      const newHistory: QuizAttempt = {
        babId,
        score,
        total: 10, // Asumsi total soal 10 (atau sesuaikan dengan data real)
        timestamp: Date.now(),
        passed: score >= 6, // Lulus jika >= 6
      };

      // 2. Cek Level Farming
      const intendedPhase = babPhaseMap[babId]; // Fase target kuis ini (misal Bab 1 = Baby)
      const playerPhase = state.phase; // Fase pemain saat ini (misal Anak)

      // Hitung urutan fase
      const playerRank = phaseOrder[playerPhase];
      const quizRank = phaseOrder[intendedPhase];

      // Jika Rank Pemain > Rank Kuis, XP = 0
      // (Contoh: Anak (2) mengerjakan Kuis Baby (1) -> Tidak dapat XP)
      const xpGained = playerRank > quizRank ? 0 : score;

      console.log(
        `Fase Pemain: ${playerPhase} (${playerRank}), Kuis: ${intendedPhase} (${quizRank}). XP: ${xpGained}`
      );

      // 3. Tambah XP & Cek Evolusi
      let newXp = state.xp + xpGained;
      let newPhase = state.phase;
      let newProgress = state.materiProgress;

      // Jika XP cukup untuk naik level
      if (newXp >= state.xpToNextLevel) {
        newXp = newXp - state.xpToNextLevel; // Reset XP (carry over)

        // Logika Evolusi Berjenjang
        if (state.phase === "Baby") {
          newPhase = "Anak";
          // Unlock Bab 2
          newProgress = {
            ...newProgress,
            bab2: { ...newProgress.bab2, unlocked: true },
          };
        } else if (state.phase === "Anak") {
          newPhase = "Remaja";
          // Unlock Bab 3
          newProgress = {
            ...newProgress,
            bab3: { ...newProgress.bab3, unlocked: true },
          };
        } else if (state.phase === "Remaja") {
          newPhase = "Dewasa";
          // Unlock Bab 4
          newProgress = {
            ...newProgress,
            bab4: { ...newProgress.bab4, unlocked: true },
          };
        }
        // Fase Dewasa sudah mentok
      }

      return {
        ...state,
        xp: newXp,
        phase: newPhase,
        materiProgress: {
          ...newProgress,
          [babId]: { ...newProgress[babId], completedQuiz: true },
        },
        quizHistory: [...state.quizHistory, newHistory],
      };
    }

    case "SET_MINIGAME_ACTIVE":
      return { ...state, isMinigameActive: action.payload };

    case "BELI_ITEM": {
      const { itemId, itemType } = action.payload;
      if (itemType === "bajuId") {
        if (state.ownedBaju.includes(itemId)) return state;
        return { ...state, ownedBaju: [...state.ownedBaju, itemId] };
      }
      if (itemType === "topiId") {
        if (state.ownedTopi.includes(itemId)) return state;
        return { ...state, ownedTopi: [...state.ownedTopi, itemId] };
      }
      if (itemType === "aksesorisId") {
        if (state.ownedAksesoris.includes(itemId)) return state;
        return { ...state, ownedAksesoris: [...state.ownedAksesoris, itemId] };
      }
      return state;
    }

    default:
      return state;
  }
};

// --- PROVIDER & HOOK (Tetap Sama) ---
const GameContext = createContext<GameContextProps | undefined>(undefined);

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

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext harus digunakan di dalam GameProvider");
  }
  return context;
};
