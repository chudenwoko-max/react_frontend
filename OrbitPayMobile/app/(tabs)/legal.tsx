import { useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

const PRIVACY_URL = "https://payhost.dev/privacy";
const TERMS_URL = "https://payhost.dev/terms";

export default function Legal() {
  const [isOpening, setIsOpening] = useState(false);

  const openLegalPage = async (url: string) => {
    if (isOpening) return;
    setIsOpening(true);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Could not open legal page:", error);
      Alert.alert("Unable to open page", "Please try again later.");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <ScreenWithTabBar>
      <View style={styles.container}>
        <Text style={styles.title}>Legal</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => openLegalPage(PRIVACY_URL)}
          disabled={isOpening}
          accessibilityRole="link"
        >
          <Text style={styles.label}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => openLegalPage(TERMS_URL)}
          disabled={isOpening}
          accessibilityRole="link"
        >
          <Text style={styles.label}>Terms &amp; Conditions</Text>
        </TouchableOpacity>
      </View>
    </ScreenWithTabBar>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  label: { fontSize: 16 },
});
