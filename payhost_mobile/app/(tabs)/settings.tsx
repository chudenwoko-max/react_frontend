import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

const Row = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={22} color="#0F172A" />
    <Text style={styles.label}>{label}</Text>
    <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
  </TouchableOpacity>
);

export default function Settings() {
  return (
    <ScreenWithTabBar>
      <ScrollView>
        <Text style={styles.section}>Account</Text>
        <Row icon="account" label="Profile" onPress={() => router.push("/(tabs)/profile")} />
        <Row icon="shield-check" label="KYC & Limits" onPress={() => router.push("/(tabs)/kyc")} />

        <Text style={styles.section}>Support</Text>
        <Row icon="book-open" label="Payhost Guide" onPress={() => router.push("/(tabs)/guide")} />
        <Row icon="message-text" label="Send feedback" onPress={() => router.push("/(tabs)/feedback")} />
        <Row
          icon="star"
          label="Rate Payhost"
          onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=YOUR_PACKAGE")}
        />

        <Text style={styles.section}>Legal</Text>
        <Row icon="file-document" label="Privacy & Terms" onPress={() => router.push("/(tabs)/legal")} />
      </ScrollView>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 13, fontWeight: "600", color: "#64748B", marginTop: 20, marginLeft: 16, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
  label: { flex: 1, marginLeft: 12, fontSize: 16 },
});