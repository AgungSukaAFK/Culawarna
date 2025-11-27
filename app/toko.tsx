// Di dalam file: app/toko.tsx

import { CustomGameAlert } from "@/app/components/CustomGameAlert"; // <-- Import
import { useGameContext } from "@/app/context/GameContext";
import { Outfit } from "@/app/types/gameTypes";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ... (Interface ShopItem & shopCategories TETAP SAMA, tidak perlu diubah) ...
interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentProps<typeof FontAwesome5>["name"];
  itemType: keyof Outfit;
}

const shopCategories: { title: string; items: ShopItem[] }[] = [
  {
    title: "Pakaian Adat (Baju)",
    items: [
      {
        id: "baju-baduy",
        name: "Baju Pangsi Baduy",
        price: 150,
        icon: "tshirt",
        itemType: "bajuId",
      },
      {
        id: "baju-batik",
        name: "Batik Banten",
        price: 200,
        icon: "tshirt",
        itemType: "bajuId",
      },
      {
        id: "baju-minang",
        name: "Baju Adat Minang",
        price: 250,
        icon: "tshirt",
        itemType: "bajuId",
      },
    ],
  },
  {
    title: "Dekorasi Ruang Tamu",
    items: [
      {
        id: "dekor-golok",
        name: "Pajangan Golok",
        price: 300,
        icon: "gavel",
        itemType: "aksesorisId",
      },
    ],
  },
];

export default function TokoScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameContext();

  // State untuk mengontrol Alert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    icon: "information-circle" as any,
    buttonText: "OK",
    showCancel: false,
    onClose: () => {},
  });

  // Helper tutup alert
  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  const checkIsOwned = (item: ShopItem): boolean => {
    if (item.itemType === "bajuId") return state.ownedBaju.includes(item.id);
    if (item.itemType === "topiId") return state.ownedTopi.includes(item.id);
    if (item.itemType === "aksesorisId")
      return state.ownedAksesoris.includes(item.id);
    return false;
  };

  const handleBeli = (item: ShopItem) => {
    // 1. Cek Milik
    if (checkIsOwned(item)) {
      setAlertConfig({
        visible: true,
        title: "Sudah Punya",
        message: "Kamu sudah memiliki item ini di koleksimu.",
        icon: "checkmark-circle",
        buttonText: "OK",
        showCancel: false,
        onClose: closeAlert,
      });
      return;
    }

    // 2. Cek Koin
    if (state.koin < item.price) {
      setAlertConfig({
        visible: true,
        title: "Uang Kurang",
        message: `Koinmu tidak cukup (${state.koin}/${item.price}).\nMainkan minigame di Pantai yuk!`,
        icon: "alert-circle",
        buttonText: "Oke",
        showCancel: false,
        onClose: closeAlert,
      });
      return;
    }

    // 3. Konfirmasi Beli (Alert 2 Tombol)
    setAlertConfig({
      visible: true,
      title: "Beli Item?",
      message: `Beli ${item.name} seharga ${item.price} Koin?`,
      icon: "cart",
      buttonText: "Beli",
      showCancel: true, // Tampilkan tombol batal
      onClose: () => {
        // Aksi BELI
        dispatch({ type: "KURANGI_KOIN", payload: item.price });
        dispatch({
          type: "BELI_ITEM",
          payload: { itemId: item.id, itemType: item.itemType },
        });
        closeAlert();

        // Alert Sukses (Chained)
        setTimeout(() => {
          setAlertConfig({
            visible: true,
            title: "Berhasil!",
            message: `${item.name} berhasil dibeli.`,
            icon: "checkmark-done-circle",
            buttonText: "Mantap",
            showCancel: false,
            onClose: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          });
        }, 300);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- RENDER CUSTOM ALERT DI SINI --- */}
      <CustomGameAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttonText={alertConfig.buttonText}
        onClose={alertConfig.onClose}
        // Render onCancel hanya jika showCancel true
        onCancel={alertConfig.showCancel ? closeAlert : undefined}
        cancelText="Batal"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#4A2A00" />
        </TouchableOpacity>
        <Text style={styles.title}>Toko Budaya</Text>
        <View style={styles.koinContainer}>
          <MaterialCommunityIcons name="gold" size={20} color="#4A2A00" />
          <Text style={styles.koinText}>{state.koin}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {shopCategories.map((category) => (
          <View key={category.title}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.items.map((item) => {
              const isOwned = checkIsOwned(item);
              const canAfford = state.koin >= item.price;

              return (
                <View
                  key={item.id}
                  style={[styles.itemContainer, isOwned && styles.itemOwned]}
                >
                  <View style={styles.iconBox}>
                    <FontAwesome5 name={item.icon} size={30} color="#4A2A00" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {isOwned ? "Sudah dimiliki" : `${item.price} Koin`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      isOwned
                        ? styles.disabledButton
                        : !canAfford
                        ? styles.disabledButton
                        : styles.buyButtonActive,
                    ]}
                    onPress={() => handleBeli(item)}
                    disabled={isOwned || !canAfford}
                  >
                    <Text style={styles.buyButtonText}>
                      {isOwned ? "Milikmu" : "Beli"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Styles TETAP SAMA seperti sebelumnya, copy paste saja styles lama)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFB347",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderBottomWidth: 2,
    borderColor: "#4A2A00",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#4A2A00" },
  koinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#4A2A00",
  },
  koinText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A2A00",
    marginLeft: 5,
  },
  scrollContainer: { flex: 1, padding: 15 },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(74, 42, 0, 0.2)",
    paddingBottom: 5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 15,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginBottom: 10,
    elevation: 3,
  },
  itemOwned: {
    backgroundColor: "rgba(220, 220, 220, 0.95)",
    borderColor: "#888",
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: "#FFE4B5",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#DEB887",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: "bold", color: "#4A2A00" },
  itemPrice: { fontSize: 14, color: "#666", marginTop: 4 },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderBottomWidth: 3,
  },
  buyButtonActive: { backgroundColor: "#28a745", borderColor: "#1e7e34" },
  disabledButton: { backgroundColor: "#6c757d", borderColor: "#4a5258" },
  buyButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
