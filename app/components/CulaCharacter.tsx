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
  const { phase, currentOutfit, selectedAppearance } = state;

  // LOGIKA UTAMA:
  // Jika user memilih "Default", gunakan fase asli (state.phase).
  // Jika user memilih spesifik (misal "Baby"), gunakan pilihan itu (selectedAppearance).
  const displayPhase =
    selectedAppearance === "Default" ? phase : selectedAppearance;

  const imageSource = getCulaImage(
    displayPhase,
    currentOutfit.bajuId,
    currentOutfit.topiId
  );

  return <Image source={imageSource} style={style} resizeMode="contain" />;
};
