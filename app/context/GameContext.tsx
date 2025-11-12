import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

// --- 1. DEFINISI TIPE DATA (TYPESCRIPT) ---

type CulaPhase = "Baby" | "Anak" | "Dewasa";

interface Outfit {
  bajuId: string | null;
  topiId: string | null;
  aksesorisId: string | null;
}

export interface FoodItem {
  id: string;
  name: string;
  energyValue: number;
  currentStacks: number;
  maxStacks: number;
  refillTimestamp: number;
  cost: number;
}

interface GameState {
  xp: number;
  xpToNextLevel: number;
  phase: CulaPhase;
  koin: number;
  energi: number;
  maxEnergi: number;
  currentOutfit: Outfit;
  foodInventory: { [foodId: string]: FoodItem };
  isLoading: boolean;
}

type GameAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_STATE"; payload: Partial<GameState> } // Payload bisa parsial
  | { type: "TAMBAH_XP"; payload: number }
  | { type: "GUNAKAN_ENERGI"; payload: number }
  | { type: "TAMBAH_ENERGI"; payload: number } // <-- Tombol debug baru
  | { type: "TAMBAH_KOIN"; payload: number }
  | { type: "KURANGI_KOIN"; payload: number }
  | {
      type: "GANTI_OUTFIT";
      payload: { itemType: keyof Outfit; itemId: string };
    }
  | { type: "EVOLUSI"; payload: { newPhase: CulaPhase; nextLevelXp: number } }
  | { type: "KONSUMSI_MAKANAN"; payload: { foodId: string } }
  | { type: "BELI_MAKANAN"; payload: { foodId: string } }
  | { type: "REFILL_MAKANAN"; payload: { foodId: string } };

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const STORAGE_KEY = "@CulawarnaGame:SaveData";
const REFILL_TIME_MS = 3 * 60 * 1000;

// --- 2. STATE AWAL ---
const initialState: GameState = {
  xp: 5,
  xpToNextLevel: 10,
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
  isLoading: true,
};

// --- 3. REDUCER (Diperbarui) ---
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    // --- PERBAIKAN LOGIKA LOADING ---
    case "LOAD_STATE":
      // Gabungkan state awal (default) dengan data yg dimuat (payload)
      // dan pastikan isLoading: false
      return { ...initialState, ...action.payload, isLoading: false };

    case "TAMBAH_XP":
      const newXp = state.xp + action.payload;
      if (newXp >= state.xpToNextLevel) {
        console.log("NAIK LEVEL / EVOLUSI!");
        return { ...state, xp: newXp - state.xpToNextLevel };
      }
      return { ...state, xp: newXp };

    case "GUNAKAN_ENERGI":
      return { ...state, energi: Math.max(0, state.energi - action.payload) };

    case "TAMBAH_ENERGI": // <-- LOGIKA BARU
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

    default:
      return state;
  }
};

// --- 4. CREATE CONTEXT ---
const GameContext = createContext<GameContextProps | undefined>(undefined);

// --- 5. PROVIDER COMPONENT (Diperbarui) ---
export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          // --- PERBAIKAN LOGIKA LOADING ---
          // Langsung kirim data yg di-parse, jangan di-merge di sini
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
