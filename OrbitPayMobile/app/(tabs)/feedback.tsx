import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

const CATEGORIES = ["Bug", "Suggestion", "Complaint", "Compliment"];

export default function Feedback() {
  const [category, setCategory] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!message.trim()) return Alert.alert("Message required");
    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL is not configured");

      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/feedback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw { response: { data } };
      }
      Alert.alert("Thank you", "Your feedback has been received.");
      setMessage("");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || e.message || "Could not send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWithTabBar>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Send feedback</Text>
        <View style={styles.cats}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.cat, category === c && styles.catOn]} onPress={() => setCategory(c)}>
              <Text style={category === c ? styles.catTextOn : styles.catText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Tell us what you think…"
          multiline
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Sending…" : "Submit"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  cat: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  catOn: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
  catText: { color: "#0F172A" },
  catTextOn: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 12, minHeight: 120, textAlignVertical: "top", marginBottom: 16 },
  btn: { backgroundColor: "#0F172A", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});