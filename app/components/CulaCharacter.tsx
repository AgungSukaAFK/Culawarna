// File: app/components/CulaCharacter.tsx
import { useGameContext } from "@/app/context/GameContext";
import { getCulaImage } from "@/app/utils/characterAssets";
import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

interface CulaCharacterProps {
  style?: StyleProp<ImageStyle>;
}

export const CulaCharacter: React.FC<CulaCharacterProps> = ({ style }) => {
  const { state } = useGameContext();
  const { phase, currentOutfit } = state;

  // Ambil gambar yang sesuai dari helper
  const imageSource = getCulaImage(
    phase,
    currentOutfit.bajuId,
    currentOutfit.topiId
  );

  return <Image source={imageSource} style={style} resizeMode="contain" />;
};
