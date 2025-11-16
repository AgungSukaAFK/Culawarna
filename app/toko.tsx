// Di dalam file: app/toko.tsx
// (VERSI BARU DENGAN KATEGORI DAN INVENTORY)

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

// --- Tipe Item Toko (Placeholder) ---
interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentProps<typeof FontAwesome5>["name"];
  itemType: keyof Outfit; // 'bajuId' atau 'topiId'
}

// --- Daftar Item Placeholder (By Kategori) ---
const shopCategories: { title: string; items: ShopItem[] }[] = [
  {
    title: "Pakaian (Baju)",
    items: [
      {
        id: "baju-pangsi",
        name: "Baju Pangsi",
        price: 100,
        icon: "tshirt",
        itemType: "bajuId",
      },
      // Tambahkan baju lain di sini jika ada
    ],
  },
  {
    title: "Pakaian (Topi)",
    items: [
      {
        id: "topi-baduy",
        name: "Iket Baduy",
        price: 50,
        icon: "hat-wizard", // Placeholder icon
        itemType: "topiId",
      },
      // Tambahkan topi lain di sini jika ada
    ],
  },
  {
    title: "Dekorasi Ruang Tamu",
    items: [
      {
        id: "dekor-golok",
        name: "Pajangan Golok",
        price: 75,
        icon: "gavel", // Placeholder icon
        itemType: "aksesorisId",
      },
      // Tambahkan dekorasi lain di sini jika ada
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
      `Yakin ingin membeli ${item.name} seharga ${item.price} koin?`,
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
              `${item.name} telah ditambahkan ke inventory kamu. Cek di Kamar (Lemari) atau Ruang Tamu (Dekorasi).`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#4A2A00" />
        </TouchableOpacity>
        <Text style={styles.title}>Toko Budaya</Text>
        {/* Koin di Header */}
        <View style={styles.koinContainer}>
          <MaterialCommunityIcons name="gold" size={20} color="#4A2A00" />
          <Text style={styles.koinText}>{state.koin}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Render berdasarkan kategori */}
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
                    isOwned && styles.itemOwned, // Beri style jika sudah dimiliki
                  ]}
                >
                  <FontAwesome5
                    name={item.icon}
                    size={40}
                    color="#4A2A00"
                    style={styles.itemIcon}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price} Koin</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      isOwned
                        ? styles.disabledButton // Style "Dimiliki"
                        : !canAfford
                        ? styles.disabledButton // Style "Tidak Mampu"
                        : styles.buyButtonActive, // Style "Bisa Beli"
                    ]}
                    onPress={() => handleBeli(item)}
                    disabled={isOwned || !canAfford}
                  >
                    <Text style={styles.buyButtonText}>
                      {isOwned ? "Dimiliki" : "Beli"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 5,
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
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
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
    padding: 10,
  },
  // Style Kategori
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A2A00",
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 15,
    borderRadius: 15,
    borderColor: "#4A2A00",
    borderWidth: 3,
    marginBottom: 10,
  },
  itemOwned: {
    backgroundColor: "rgba(220, 220, 220, 0.8)",
  },
  itemIcon: {
    marginRight: 15,
    width: 40,
    textAlign: "center",
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
    color: "#4A2A00",
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
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
