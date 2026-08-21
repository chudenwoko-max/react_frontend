import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import axiosClient from "../../src/api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FundWalletScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  // Load any pending reference when screen opens
  useEffect(() => {
    const loadPending = async () => {
      const pendingRef = await AsyncStorage.getItem("pending_funding_reference");
      if (pendingRef) {
        setReference(pendingRef);
      }
    };
    loadPending();
  }, []);

  const handleInitialize = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      Alert.alert("Invalid Amount", "Minimum funding amount is ₦100");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("wallet/fund/initialize/", {
        amount: Number(amount),
      });

      const { authorization_url, reference: ref } = res.data;

      // Save reference
      await AsyncStorage.setItem("pending_funding_reference", ref);
      setReference(ref);

      // Open Paystack
      await Linking.openURL(authorization_url);

      Alert.alert(
        "Complete Payment",
        "After paying on Paystack, return to this app and tap \"Verify Payment\"."
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!reference.trim()) {
      Alert.alert("Missing Reference", "No payment reference found");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.get(
        `wallet/fund/verify/?reference=${reference.trim()}`
      );

      const data = res.data;

      // Clear pending reference
      await AsyncStorage.removeItem("pending_funding_reference");

      // Go to success screen
      router.replace({
        pathname: "/payment-success",
        params: {
          amount: String(data.amount || "0"),
          new_balance: String(data.new_balance || "0"),
          reference: String(data.reference || reference),
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        error?.response?.data?.error || "Could not verify payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fund Wallet</Text>
      <Text style={styles.subtitle}>Minimum amount: ₦100</Text>

      <Text style={styles.label}>Amount (₦)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5000"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleInitialize}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        )}
      </TouchableOpacity>

      {/* Show Verify button only if we have a reference */}
      {reference ? (
        <View style={styles.verifySection}>
          <Text style={styles.instruction}>
            After completing payment on Paystack, come back here and tap the button below.
          </Text>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.disabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 30,
  },
  label: {
    color: "#CCC",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  verifyButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  verifySection: {
    marginTop: 40,
  },
  instruction: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
});