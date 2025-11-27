// Di dalam file: app/components/CustomGameAlert.tsx

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomGameAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void; // Aksi Tombol Utama (OK/Beli/Lanjut)
  onCancel?: () => void; // Aksi Tombol Kedua (Batal/Keluar) -- OPSIONAL
  buttonText?: string; // Teks Tombol Utama (Default: OK)
  cancelText?: string; // Teks Tombol Kedua (Default: Batal)
  icon?: React.ComponentProps<typeof Ionicons>["name"]; // Custom Icon
}

export const CustomGameAlert: React.FC<CustomGameAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  onCancel,
  buttonText = "OK",
  cancelText = "Batal",
  icon = "information-circle",
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <BlurView
        intensity={20}
        tint={Platform.OS === "web" ? "light" : "dark"}
        style={styles.backdrop}
      >
        <View style={styles.container}>
          <Ionicons
            name={icon}
            size={50}
            color="#4A2A00"
            style={{ marginBottom: 10 }}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {/* Jika onCancel ada, tampilkan tombol Batal */}
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Tombol Utama */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !onCancel && { width: "100%" },
              ]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  container: {
    width: "85%",
    maxWidth: 350,
    backgroundColor: "#FFF8E7",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#4A2A00",
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
  },
  confirmButton: {
    backgroundColor: "#28a745", // Hijau
    borderColor: "#1e7e34",
  },
  cancelButton: {
    backgroundColor: "#dc3545", // Merah
    borderColor: "#a71d2a",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
