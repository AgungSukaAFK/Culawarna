// File: app/utils/characterAssets.ts

// Pastikan Anda sudah me-rename 'baby_baduy.png' menjadi 'baby-baduy.png'
export const CharacterImages = {
  Baby: {
    base: require("@/assets/images/chars/baby.png"),
    baduy: require("@/assets/images/chars/baby-baduy.png"),
    batik: require("@/assets/images/chars/baby-batik.png"),
    "batik-peci": require("@/assets/images/chars/baby-batik-peci.png"),
  },
  Anak: {
    base: require("@/assets/images/chars/anak.png"),
    baduy: require("@/assets/images/chars/anak-baduy.png"),
    batik: require("@/assets/images/chars/anak-batik.png"),
    "batik-peci": require("@/assets/images/chars/anak-batik-peci.png"),
  },
  Remaja: {
    base: require("@/assets/images/chars/remaja.png"),
    baduy: require("@/assets/images/chars/remaja-baduy.png"),
    batik: require("@/assets/images/chars/remaja-batik.png"),
    "batik-peci": require("@/assets/images/chars/remaja-batik-peci.png"),
  },
  Dewasa: {
    base: require("@/assets/images/chars/dewasa.png"),
    baduy: require("@/assets/images/chars/dewasa-baduy.png"),
    batik: require("@/assets/images/chars/dewasa-batik.png"),
    "batik-peci": require("@/assets/images/chars/dewasa-batik-peci.png"),
  },
};

export const getCulaImage = (
  phase: "Baby" | "Anak" | "Remaja" | "Dewasa",
  bajuId: string | null,
  topiId: string | null
) => {
  const phaseAssets = CharacterImages[phase];

  // --- LOGIKA KOMBINASI ---

  // 1. Jika pakai Batik + Peci (Ada gambarnya)
  if (bajuId === "baju-batik" && topiId === "peci-hitam") {
    return phaseAssets["batik-peci"];
  }

  // 2. Jika pakai Baju Baduy (Apapun topinya, tetap tampilkan Baduy saja karena tidak ada varian Baduy+Peci)
  if (bajuId === "baju-baduy") {
    return phaseAssets["baduy"];
  }

  // 3. Jika pakai Baju Batik saja (Tanpa Peci)
  if (bajuId === "baju-batik") {
    return phaseAssets["batik"];
  }

  // 4. Default (Tidak pakai baju, atau kombinasi yang tidak ada gambarnya)
  // Misal: Hanya pakai Peci tapi tidak pakai baju -> Kembali ke Base (Telanjang)
  return phaseAssets["base"];
};
