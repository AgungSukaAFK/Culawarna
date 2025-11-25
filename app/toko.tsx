// Di dalam file: app/toko.tsx

import { useGameContext } from "@/app/context/GameContext";
import { Outfit } from "@/app/types/gameTypes";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Tipe Item Toko ---
interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentProps<typeof FontAwesome5>["name"];
  itemType: keyof Outfit; // 'bajuId', 'topiId', atau 'aksesorisId'
}

// --- DAFTAR ITEM TOKO (Updated) ---
// Pastikan ID di sini SAMA PERSIS dengan di characterAssets.ts
const shopCategories: { title: string; items: ShopItem[] }[] = [
  {
    title: "Pakaian Adat (Baju)",
    items: [
      {
        id: "baju-baduy", // ID harus sama dengan logic karakter
        name: "Baju Pangsi Baduy",
        price: 150,
        icon: "tshirt",
        itemType: "bajuId",
      },
      {
        id: "baju-batik", // Item Baru: Batik
        name: "Batik Banten",
        price: 200,
        icon: "tshirt",
        itemType: "bajuId",
      },
    ],
  },
  {
    title: "Aksesoris Kepala",
    items: [
      {
        id: "peci-hitam", // Item Baru: Peci
        name: "Peci Nasional",
        price: 50,
        icon: "hat-wizard", // Ikon placeholder
        itemType: "topiId",
      },
      // Jika nanti ada Caping:
      // { id: "caping-petani", name: "Caping Petani", price: 75, icon: "hat-cowboy", itemType: "topiId" },
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

  // Cek apakah item sudah dimiliki
  const checkIsOwned = (item: ShopItem): boolean => {
    if (item.itemType === "bajuId") {
      return state.ownedBaju.includes(item.id);
    }
    if (item.itemType === "topiId") {
      return state.ownedTopi.includes(item.id);
    }
    if (item.itemType === "aksesorisId") {
      return state.ownedAksesoris.includes(item.id);
    }
    return false;
  };

  const handleBeli = (item: ShopItem) => {
    // 1. Cek apakah sudah dimiliki
    if (checkIsOwned(item)) {
      Alert.alert("Sudah Dimiliki", "Kamu sudah memiliki item ini.");
      return;
    }

    // 2. Cek koin
    if (state.koin < item.price) {
      Alert.alert(
        "Koin Tidak Cukup",
        "Kumpulkan koin lagi dari minigame di Pantai!"
      );
      return;
    }

    // 3. Tampilkan konfirmasi
    Alert.alert(
      "Konfirmasi Pembelian",
      `Beli ${item.name} seharga ${item.price} koin?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Beli",
          onPress: () => {
            // 4. Kurangi koin
            dispatch({ type: "KURANGI_KOIN", payload: item.price });

            // 5. Tambahkan ke inventory
            dispatch({
              type: "BELI_ITEM",
              payload: { itemId: item.id, itemType: item.itemType },
            });

            // 6. Beri notifikasi sukses
            Alert.alert(
              "Berhasil Dibeli!",
              `${item.name} telah ditambahkan ke Lemari.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#4A2A00" />
        </TouchableOpacity>
        <Text style={styles.title}>Toko Budaya</Text>
        {/* Koin Display */}
        <View style={styles.koinContainer}>
          <MaterialCommunityIcons name="gold" size={20} color="#4A2A00" />
          <Text style={styles.koinText}>{state.koin}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Render Kategori */}
        {shopCategories.map((category) => (
          <View key={category.title}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.items.map((item) => {
              const isOwned = checkIsOwned(item);
              const canAfford = state.koin >= item.price;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemContainer,
                    isOwned && styles.itemOwned, // Style beda jika sudah punya
                  ]}
                >
                  {/* Ikon Item */}
                  <View style={styles.iconBox}>
                    <FontAwesome5 name={item.icon} size={30} color="#4A2A00" />
                  </View>

                  {/* Info Item */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {isOwned ? "Sudah dimiliki" : `${item.price} Koin`}
                    </Text>
                  </View>

                  {/* Tombol Beli */}
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
  },
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
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderBottomWidth: 3,
  },
  buyButtonActive: {
    backgroundColor: "#28a745", // Hijau
    borderColor: "#1e7e34",
  },
  disabledButton: {
    backgroundColor: "#6c757d", // Abu-abu
    borderColor: "#4a5258",
  },
  buyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
