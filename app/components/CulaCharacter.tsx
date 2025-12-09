// Di dalam file: app/components/CulaCharacter.tsx

import { useGameContext } from "@/app/context/GameContext";
import { getCulaImage } from "@/app/utils/characterAssets";
import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

interface CulaCharacterProps {
  style?: StyleProp<ImageStyle>;
}

export const CulaCharacter: React.FC<CulaCharacterProps> = ({ style }) => {
  const { state } = useGameContext();
  
  // Ambil state yang dibutuhkan
  const { phase, currentOutfit, selectedAppearance, energi } = state;

  // Logika Tampilan (Appearance Mode di Settings)
  // Jika user pilih "Default", gunakan fase asli. Jika tidak, gunakan pilihan user.
  const displayPhase = selectedAppearance === "Default" ? phase : selectedAppearance;

  // Panggil helper dengan parameter energi
  const imageSource = getCulaImage(
    displayPhase,
    currentOutfit.bajuId,
    energi // <-- Kirim data energi ke helper
  );

  return <Image source={imageSource} style={style} resizeMode="contain" />;
};