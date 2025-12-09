// Di dalam file: app/utils/characterAssets.ts

// Mapping Asset Gambar
export const CharacterImages = {
  Baby: {
    // Normal
    base: require("@/assets/images/chars/baby.png"),
    baduy: require("@/assets/images/chars/baby-baduy.png"),
    batik: require("@/assets/images/chars/baby-batik.png"),
    minang: require("@/assets/images/chars/baby-minang.png"),
    // Lelah (Energi < 50)
    "base-lelah": require("@/assets/images/chars/baby-lelah.png"),
    "baduy-lelah": require("@/assets/images/chars/baby-baduy-lelah.png"),
    "batik-lelah": require("@/assets/images/chars/baby-batik-lelah.png"),
    "minang-lelah": require("@/assets/images/chars/baby-minang-lelah.png"),
  },
  Anak: {
    // Normal
    base: require("@/assets/images/chars/anak.png"),
    baduy: require("@/assets/images/chars/anak-baduy.png"),
    batik: require("@/assets/images/chars/anak-batik.png"),
    minang: require("@/assets/images/chars/anak-minang.png"),
    // Lelah
    "base-lelah": require("@/assets/images/chars/anak-lelah.png"),
    "baduy-lelah": require("@/assets/images/chars/anak-baduy-lelah.png"),
    "batik-lelah": require("@/assets/images/chars/anak-batik-lelah.png"),
    "minang-lelah": require("@/assets/images/chars/anak-minang-lelah.png"),
  },
  Remaja: {
    // Normal
    base: require("@/assets/images/chars/remaja.png"),
    baduy: require("@/assets/images/chars/remaja-baduy.png"),
    batik: require("@/assets/images/chars/remaja-batik.png"),
    minang: require("@/assets/images/chars/remaja-minang.png"),
    // Lelah
    "base-lelah": require("@/assets/images/chars/remaja-lelah.png"),
    "baduy-lelah": require("@/assets/images/chars/remaja-baduy-lelah.png"),
    "batik-lelah": require("@/assets/images/chars/remaja-batik-lelah.png"),
    "minang-lelah": require("@/assets/images/chars/remaja-minang-lelah.png"),
  },
  Dewasa: {
    // Normal
    base: require("@/assets/images/chars/dewasa.png"),
    baduy: require("@/assets/images/chars/dewasa-baduy.png"),
    batik: require("@/assets/images/chars/dewasa-batik.png"),
    minang: require("@/assets/images/chars/dewasa-minang.png"),
    // Lelah
    "base-lelah": require("@/assets/images/chars/dewasa-lelah.png"),
    "baduy-lelah": require("@/assets/images/chars/dewasa-baduy-lelah.png"),
    "batik-lelah": require("@/assets/images/chars/dewasa-batik-lelah.png"),
    "minang-lelah": require("@/assets/images/chars/dewasa-minang-lelah.png"),
  },
};

// Helper Function
export const getCulaImage = (
  phase: "Baby" | "Anak" | "Remaja" | "Dewasa",
  bajuId: string | null,
  energi: number // <-- Parameter Baru
) => {
  const phaseAssets = CharacterImages[phase];
  
  // Tentukan suffix berdasarkan energi
  const suffix = energi < 50 ? "-lelah" : "";

  // Logika Pemilihan Gambar
  if (bajuId === "baju-minang") return phaseAssets[`minang${suffix}`];
  if (bajuId === "baju-baduy") return phaseAssets[`baduy${suffix}`];
  if (bajuId === "baju-batik") return phaseAssets[`batik${suffix}`];

  // Default (Polos)
  return phaseAssets[`base${suffix}`];
};