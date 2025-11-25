// Di dalam file: app/kamar.tsx

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Impor Tipe, Layout, dan Komponen Karakter Baru
import { CulaCharacter } from "@/app/components/CulaCharacter";
import { GameHUDLayout } from "@/app/components/GameHUDLayout";
import { useGameContext } from "@/app/context/GameContext";
import { ModalLemariProps, Outfit } from "@/app/types/gameTypes";

// --- KOMPONEN MODAL SPESIFIK KAMAR ---
const ModalLemari: React.FC<ModalLemariProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGameContext();

  const handleGanti = (itemType: keyof Outfit, itemId: string | null) => {
    // ATURAN 1: Jika memilih Baju Baduy, lepas Topi otomatis
    if (itemType === "bajuId" && itemId === "baju-baduy") {
      dispatch({
        type: "GANTI_OUTFIT",
        payload: { itemType: "topiId", itemId: null },
      });
    }

    // ATURAN 2: Jika sedang pakai Baduy, tidak bisa pasang Topi
    if (itemType === "topiId" && itemId !== null) {
      if (state.currentOutfit.bajuId === "baju-baduy") {
        Alert.alert(
          "Tidak Bisa",
          "Pakaian Baduy tidak dapat dikombinasikan dengan topi ini. Lepas baju Baduy terlebih dahulu."
        );
        return;
      }
    }

    dispatch({
      type: "GANTI_OUTFIT",
      payload: { itemType, itemId },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={10} tint="dark" style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Lemari Baju</Text>
          <ScrollView style={{ width: "100%" }}>
            {/* --- Kategori Topi --- */}
            <Text style={styles.categoryTitle}>Topi</Text>
            <View style={styles.lemariGrid}>
              {/* Tombol Lepas Topi (Berfungsi sebagai kembali ke dasar) */}
              <TouchableOpacity
                style={[
                  styles.itemBaju,
                  (state.currentOutfit.topiId === null ||
                    state.currentOutfit.topiId === "topi-dasar") &&
                    styles.itemSelected,
                ]}
                onPress={() => handleGanti("topiId", null)}
              >
                <Ionicons name="close-circle" size={40} color="#4A2A00" />
                <Text style={styles.itemBajuText}>Lepas</Text>
              </TouchableOpacity>

              {/* List Topi (Filter 'topi-dasar' agar tidak muncul) */}
              {state.ownedTopi
                .filter((id) => id !== "topi-dasar")
                .map((itemId) => (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.itemBaju,
                      state.currentOutfit.topiId === itemId &&
                        styles.itemSelected,
                      state.currentOutfit.bajuId === "baju-baduy" &&
                        styles.itemDisabled,
                    ]}
                    onPress={() => handleGanti("topiId", itemId)}
                  >
                    <FontAwesome5
                      name="hat-wizard"
                      size={40}
                      color={
                        state.currentOutfit.bajuId === "baju-baduy"
                          ? "#999"
                          : "#4A2A00"
                      }
                    />
                    <Text style={styles.itemBajuText}>{itemId}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* --- Kategori Baju --- */}
            <Text style={styles.categoryTitle}>Baju</Text>
            <View style={styles.lemariGrid}>
              {/* Tombol Lepas Baju (Berfungsi sebagai kembali ke dasar) */}
              <TouchableOpacity
                style={[
                  styles.itemBaju,
                  (state.currentOutfit.bajuId === null ||
                    state.currentOutfit.bajuId === "baju-dasar") &&
                    styles.itemSelected,
                ]}
                onPress={() => handleGanti("bajuId", null)}
              >
                <Ionicons name="close-circle" size={40} color="#4A2A00" />
                <Text style={styles.itemBajuText}>Lepas</Text>
              </TouchableOpacity>

              {/* List Baju (Filter 'baju-dasar' agar tidak muncul) */}
              {state.ownedBaju
                .filter((id) => id !== "baju-dasar")
                .map((itemId) => (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.itemBaju,
                      state.currentOutfit.bajuId === itemId &&
                        styles.itemSelected,
                    ]}
                    onPress={() => handleGanti("bajuId", itemId)}
                  >
                    <FontAwesome5 name="tshirt" size={40} color="#4A2A00" />
                    <Text style={styles.itemBajuText}>{itemId}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.modalButton,
              styles.kembaliButton,
              { alignSelf: "center", marginTop: 20 },
            ]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.modalButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

// --- LAYAR KAMAR ---
export default function KamarScreen() {
  const router = useRouter();
  const { state } = useGameContext();
  const [isLemariVisible, setLemariVisible] = useState<boolean>(false);

  return (
    <GameHUDLayout
      backgroundImage={require("@/assets/images/kamar_bg.png")}
      onPressNavLeft={() => router.replace("/dapur")}
      onPressNavRight={() => router.replace("/ruangTamu")}
      middleNavButton={{
        onPress: () => setLemariVisible(true),
        icon: (
          <MaterialCommunityIcons name="tshirt-crew" size={24} color="white" />
        ),
        text: "Lemari",
      }}
      pageModal={
        <ModalLemari
          visible={isLemariVisible}
          onClose={() => setLemariVisible(false)}
        />
      }
    >
      {/* Konten Halaman Ini */}
      <View style={styles.kontenArea}>
        <View style={styles.debugInfo}>
          {/* Menampilkan label '-' jika null atau 'dasar' */}
          <Text style={styles.textPlaceholder}>
            Baju:{" "}
            {state.currentOutfit.bajuId &&
            state.currentOutfit.bajuId !== "baju-dasar"
              ? state.currentOutfit.bajuId
              : "-"}
          </Text>
          <Text style={styles.textPlaceholder}>
            Topi:{" "}
            {state.currentOutfit.topiId &&
            state.currentOutfit.topiId !== "topi-dasar"
              ? state.currentOutfit.topiId
              : "-"}
          </Text>
        </View>

        <CulaCharacter style={styles.karakterKamar} />
      </View>
    </GameHUDLayout>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  kontenArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 90,
  },
  karakterKamar: {
    width: 320,
    height: 320,
    resizeMode: "contain",
  },
  debugInfo: {
    position: "absolute",
    top: 100,
    alignItems: "center",
    zIndex: 1,
  },
  textPlaceholder: {
    fontSize: 12,
    color: "black",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 4,
    borderRadius: 5,
    marginBottom: 2,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 340,
    maxHeight: "80%",
    backgroundColor: "#FFB347",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#4A2A00",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 20,
    alignSelf: "center",
  },
  modalButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  kembaliButton: {
    backgroundColor: "#8A2BE2",
    borderColor: "#4B0082",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2A00",
    alignSelf: "flex-start",
    marginTop: 15,
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(74, 42, 0, 0.2)",
    width: "100%",
  },
  lemariGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  itemBaju: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A2A00",
    width: "30%",
    margin: "1.5%",
  },
  itemSelected: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    borderWidth: 3,
  },
  itemDisabled: {
    opacity: 0.5,
    backgroundColor: "#ddd",
    borderColor: "#999",
  },
  itemBajuText: {
    marginTop: 5,
    color: "#4A2A00",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
});
