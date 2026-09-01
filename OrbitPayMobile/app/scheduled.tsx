import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ScheduledScreen() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="calendar-clock" size={48} color="#94A3B8" />
      <Text style={styles.title}>Scheduled transfers paused</Text>
      <Text style={styles.body}>
        Repeating transfers are not running in production yet. Use Send for a
        one-time OrbitPay transfer.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/(tabs)/send")}>
        <Text style={styles.btnText}>Go to Send</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.link}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    marginTop: 28,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  link: { marginTop: 16, color: "#0284C7", fontWeight: "600", fontSize: 15 },
});