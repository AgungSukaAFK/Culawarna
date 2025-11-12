import { useGameContext } from "@/app/context/GameContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RiwayatScreen() {
  const router = useRouter();
  const { state } = useGameContext();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#4A2A00" />
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Belajar</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {state.quizHistory.length === 0 && (
          <Text style={styles.emptyText}>Belum ada riwayat kuis.</Text>
        )}
        {state.quizHistory.map((item, index) => (
          <View
            key={index}
            style={[
              styles.historyItem,
              item.passed ? styles.passedItem : styles.failedItem,
            ]}
          >
            <Text style={styles.itemTitle}>
              Kuis {item.babId.toUpperCase()}
            </Text>
            <Text style={styles.itemScore}>
              Skor: {item.score} / {item.total}
            </Text>
            <Text style={styles.itemDate}>
              {new Date(item.timestamp).toLocaleString("id-ID")}
            </Text>
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
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 5,
    borderColor: "#4A2A00",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A2A00",
  },
  scrollContainer: {
    flex: 1,
    padding: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4A2A00",
  },
  historyItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  passedItem: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
  },
  failedItem: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemScore: {
    fontSize: 14,
    color: "#333",
  },
  itemDate: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
});
