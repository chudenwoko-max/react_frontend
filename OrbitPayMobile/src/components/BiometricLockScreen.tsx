import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  onUnlockWithBiometrics: () => Promise<boolean>;
  onUsePin: () => void; // you will open your existing PIN modal here
}

export default function BiometricLockScreen({
  onUnlockWithBiometrics,
  onUsePin,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleBiometric = async () => {
    setLoading(true);
    try {
      const success = await onUnlockWithBiometrics();
      if (!success) {
        Alert.alert(
          "Authentication Failed",
          "Please try again or use your Transaction PIN."
        );
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please use your PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="fingerprint" size={72} color="#0F172A" />
      </View>

      <Text style={styles.title}>OrbitPay is Locked</Text>
      <Text style={styles.subtitle}>
        Authenticate to access your account
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleBiometric}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <MaterialCommunityIcons
              name="fingerprint"
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Unlock with Biometrics</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onUsePin}>
        <Text style={styles.secondaryButtonText}>Use Transaction PIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: "100%",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
});