// Di dalam file: app/toko.tsx

import { useSFX } from "@/app/_layout";
import { CustomGameAlert } from "@/app/components/CustomGameAlert";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { HelpContent } from "@/app/types/gameTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- ASET TOKO ---
const SHOP_ASSETS: { [key: string]: ImageSourcePropType } = {
  // Outfit
  "baju-baduy": require("@/assets/images/outfit/baduy.png"),
  "baju-batik": require("@/assets/images/outfit/batik.png"),
  "baju-minang": require("@/assets/images/outfit/minang.png"),
  // Dekorasi
  "dekor-golok": require("@/assets/images/deco/golok.png"),
  "dekor-bedug": require("@/assets/images/deco/bedug.png"),
  "dekor-lukisan": require("@/assets/images/guest-deco2.png"), 
};

// --- DATA ITEM TOKO ---
const SHOP_ITEMS = [
  {
    id: "baju-baduy",
    name: "Baju Baduy",
    price: 150,
    type: "bajuId",
    desc: "Pakaian adat suku Baduy.",
  },
  {
    id: "baju-batik",
    name: "Batik Banten",
    price: 200,
    type: "bajuId",
    desc: "Motif khas Banten.",
  },
  {
    id: "baju-minang",
    name: "Baju Minang",
    price: 250,
    type: "bajuId",
    desc: "Pakaian adat Sumatera Barat.",
  },
  {
    id: "dekor-golok",
    name: "Golok Ciomas",
    price: 300,
    type: "aksesorisId",
    desc: "Senjata tradisional Banten.",
  },
  {
    id: "dekor-bedug",
    name: "Bedug Banten",
    price: 350,
    type: "aksesorisId",
    desc: "Alat musik tradisional.",
  },
  {
    id: "dekor-lukisan",
    name: "Lukisan Bedug",
    price: 450,
    type: "aksesorisId",
    desc: "Lukisan Rampak Bedug.",
  },
];

export default function TokoScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameContext();
  const { playSfx, playBtnSound } = useSFX();

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    icon: "cart" as any,
    buttonText: "OK",
    onClose: () => {},
  });

  // --- KONTEN BANTUAN (Dipindah ke dalam komponen) ---
  const tokoHelpContent: HelpContent = {
    title: "Toko Budaya 🏪",
    body: (
      <View>
        <Text style={styles.helpText}>
          Belanjakan koinmu di sini untuk membeli item budaya!
        </Text>
        <Text style={styles.helpText}>
          • <Text style={styles.bold}>Outfit:</Text> Baju adat untuk Si Cula.
          {"\n"}• <Text style={styles.bold}>Dekorasi:</Text> Hiasan untuk Ruang
          Tamu.
        </Text>
      </View>
    ),
  };

  const handleBuy = (item: any) => {
    // Cek apakah sudah punya
    const isOwned =
      state.ownedBaju.includes(item.id) ||
      state.ownedAksesoris.includes(item.id);

    if (isOwned) {
      playSfx("tap");
      setAlertConfig({
        visible: true,
        title: "Sudah Punya",
        message: `Kamu sudah memiliki ${item.name}.`,
        icon: "checkmark-circle",
        buttonText: "Oke",
        onClose: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    // Cek uang
    if (state.koin < item.price) {
      playSfx("quiz_wrong");
      setAlertConfig({
        visible: true,
        title: "Koin Kurang",
        message: "Kumpulkan lebih banyak koin dari Minigame!",
        icon: "close-circle",
        buttonText: "Tutup",
        onClose: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    // Proses Beli
    playSfx("quiz_correct");
    dispatch({ type: "KURANGI_KOIN", payload: item.price });
    dispatch({
      type: "BELI_ITEM",
      payload: { itemId: item.id, itemType: item.type },
    });

    setAlertConfig({
      visible: true,
      title: "Berhasil Membeli! 🎉",
      message: `${item.name} telah ditambahkan ke koleksimu.`,
      icon: "gift",
      buttonText: "Mantap",
      onClose: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/homescreen_bg.png")}
      onPressNavLeft={() => router.replace("/")}
      onPressNavRight={() => {}}
      helpContent={tokoHelpContent}
      middleNavButton={{
        onPress: () => {
          playBtnSound();
          setAlertConfig({
            visible: true,
            title: "Info Toko",
            message: "Barang baru akan datang setiap update!",
            icon: "information-circle",
            buttonText: "Sip",
            onClose: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          });
        },
        icon: <MaterialCommunityIcons name="store" size={24} color="white" />,
        text: "Info",
      }}
      pageModal={null}
    >
      <View style={styles.container}>
        <CustomGameAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          buttonText={alertConfig.buttonText}
          onClose={alertConfig.onClose}
        />

        <View style={styles.headerContainer}>
          <Text style={styles.shopTitle}>Toko Budaya</Text>
          <View style={styles.coinBadge}>
            <MaterialCommunityIcons name="gold" size={20} color="#FFD700" />
            <Text style={styles.coinText}>{state.koin}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.itemsGrid}>
            {SHOP_ITEMS.map((item) => {
              const isOwned =
                state.ownedBaju.includes(item.id) ||
                state.ownedAksesoris.includes(item.id);

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.imageContainer}>
                    <Image 
                      source={SHOP_ASSETS[item.id]} 
                      style={styles.itemImage}
                      resizeMode="contain" 
                    />
                  </View>
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      isOwned ? styles.ownedButton : styles.activeButton,
                    ]}
                    onPress={() => handleBuy(item)}
                    disabled={isOwned}
                  >
                    {isOwned ? (
                      <Text style={styles.buyButtonText}>Dimiliki</Text>
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons
                          name="gold"
                          size={16}
                          color="white"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.buyButtonText}>{item.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </View>
    </GameHUDLayout>
  );
}

const styles = StyleSheet.create({
  helpText: { fontSize: 16, color: "#333", lineHeight: 24, marginBottom: 5 },
  bold: { fontWeight: "bold", color: "#4A2A00" },
  
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  headerContainer: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#8B4513",
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  coinText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 5,
  },
  scrollArea: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: 15,
  },
  itemCard: {
    width: "45%",
    maxWidth: 200,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D2B48C",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F5F5DC",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  itemImage: {
    width: "80%",
    height: "80%",
  },
  itemInfo: {
    alignItems: "center",
    marginBottom: 10,
    height: 50,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2A00",
    textAlign: "center",
  },
  itemDesc: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#27AE60",
  },
  ownedButton: {
    backgroundColor: "#95a5a6",
  },
  buyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});