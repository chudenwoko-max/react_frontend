import { View, Text, StyleSheet } from "react-native";
import { useConnectivity } from "../network/connectivity";

export default function OfflineBanner() {
  const { showBanner, isOffline } = useConnectivity();
  if (!showBanner) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        {isOffline
          ? "No internet connection"
          : "Can't reach OrbitPay right now. Pull to refresh."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#0F172A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});