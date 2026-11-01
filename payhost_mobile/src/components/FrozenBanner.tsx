import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function FrozenBanner() {
  const { user } = useAuth() as { user?: { is_frozen?: boolean; frozen_reason?: string } };
  if (!user?.is_frozen) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Wallet frozen{user.frozen_reason ? `: ${user.frozen_reason}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#7F1D1D",
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  text: { color: "#FEE2E2", fontSize: 13, fontWeight: "700", textAlign: "center" },
});