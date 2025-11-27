// app/utils/characterAssets.ts

export const CharacterImages = {
  Baby: {
    base: require("@/assets/images/chars/baby.png"),
    baduy: require("@/assets/images/chars/baby-baduy.png"),
    batik: require("@/assets/images/chars/baby-batik-peci.png"),
    // Tambahkan ini (pastikan file ada, atau ganti ke placeholder sementara)
    minang: require("@/assets/images/chars/baby-minang.png"),
    "batik-peci": require("@/assets/images/chars/baby-batik-peci.png"), // Bisa dihapus jika tidak dipakai
  },
  Anak: {
    base: require("@/assets/images/chars/anak.png"),
    baduy: require("@/assets/images/chars/anak-baduy.png"),
    batik: require("@/assets/images/chars/anak-batik-peci.png"),
    minang: require("@/assets/images/chars/anak-minang.png"),
    "batik-peci": require("@/assets/images/chars/anak-batik-peci.png"),
  },
  Remaja: {
    base: require("@/assets/images/chars/remaja.png"),
    baduy: require("@/assets/images/chars/remaja-baduy.png"),
    batik: require("@/assets/images/chars/remaja-batik-peci.png"),
    minang: require("@/assets/images/chars/remaja-minang.png"),
    "batik-peci": require("@/assets/images/chars/remaja-batik-peci.png"),
  },
  Dewasa: {
    base: require("@/assets/images/chars/dewasa.png"),
    baduy: require("@/assets/images/chars/dewasa-baduy.png"),
    batik: require("@/assets/images/chars/dewasa-batik-peci.png"),
    minang: require("@/assets/images/chars/dewasa-minang.png"),
    "batik-peci": require("@/assets/images/chars/dewasa-batik-peci.png"),
  },
};

export const getCulaImage = (
  phase: "Baby" | "Anak" | "Remaja" | "Dewasa",
  bajuId: string | null,
  topiId: string | null
) => {
  const phaseAssets = CharacterImages[phase];

  // Sederhanakan logika karena Topi dihapus dari UI
  if (bajuId === "baju-baduy") return phaseAssets["baduy"];
  if (bajuId === "baju-batik") return phaseAssets["batik"];
  if (bajuId === "baju-minang") return phaseAssets["minang"];

  // Fallback lama (jika masih ada sisa data topi di save file)
  if (bajuId === "baju-batik" && topiId === "peci-hitam") {
    return phaseAssets["batik-peci"];
  }

  return phaseAssets["base"];
};
