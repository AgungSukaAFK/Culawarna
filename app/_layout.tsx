import { Stack } from "expo-router";
import { GameProvider } from "./context/GameContext";

export default function RootLayout() {
  return (
    // 2. Bungkus <Stack> dengan <GameProvider>
    <GameProvider>
      <Stack />
    </GameProvider>
  );
}
