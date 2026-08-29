import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import axiosClient from "../../src/api/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_REF_KEY = "pending_funding_reference";
const PENDING_AMOUNT_KEY = "pending_funding_amount";

export default function FundWalletScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const verifyingRef = useRef(false);

  const hasPending = Boolean(reference);

  useEffect(() => {
    const loadPending = async () => {
      const pendingRef = await AsyncStorage.getItem(PENDING_REF_KEY);
      const pendingAmount = await AsyncStorage.getItem(PENDING_AMOUNT_KEY);
      if (pendingRef) setReference(pendingRef);
      if (pendingAmount) setAmount(pendingAmount);
    };
    loadPending();
  }, []);

  const runVerify = async (ref: string) => {
    if (!ref || verifyingRef.current) return;
    verifyingRef.current = true;
    setLoading(true);
    try {
      const res = await axiosClient.get("wallet/fund/verify/", {
        params: { reference: ref.trim() },
      });
      const data = res.data;

      await AsyncStorage.multiRemove([PENDING_REF_KEY, PENDING_AMOUNT_KEY]);
      setReference("");

      router.replace({
        pathname: "/payment-success",
        params: {
          amount: String(data.amount || amount || "0"),
          new_balance: String(data.new_balance || "0"),
          reference: String(data.reference || ref),
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        error?.response?.data?.error ||
          "Payment not confirmed yet. If you already paid, tap Verify again."
      );
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && reference && !verifyingRef.current) {
        runVerify(reference);
      }
    });
    return () => sub.remove();
  }, [reference]);

  const handleInitialize = async () => {
    if (hasPending || loading) return;

    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      Alert.alert("Invalid Amount", "Minimum funding amount is ₦100");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("wallet/fund/initialize/", {
        amount: Number(amount),
        reference_id: reference || undefined,
      });

      const { authorization_url, reference: ref } = res.data;
      await AsyncStorage.setItem(PENDING_REF_KEY, ref);
      await AsyncStorage.setItem(PENDING_AMOUNT_KEY, amount);
      setReference(ref);
      await Linking.openURL(authorization_url);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPending = () => {
    Alert.alert(
      "Start new payment?",
      "This abandons the current Paystack checkout. Use this only if you did not complete payment.",
      [
        { text: "Keep waiting", style: "cancel" },
        {
          text: "Start new",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove([PENDING_REF_KEY, PENDING_AMOUNT_KEY]);
            setReference("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fund Wallet</Text>
      <Text style={styles.subtitle}>Minimum amount: ₦100</Text>

      <Text style={styles.label}>Amount (₦)</Text>
      <TextInput
        style={[styles.input, hasPending && styles.inputLocked]}
        placeholder="e.g. 5000"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        editable={!hasPending}
        onChangeText={setAmount}
      />

      {!hasPending ? (
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
      ) : (
        <View style={styles.verifySection}>
          <Text style={styles.instruction}>
            Paystack checkout started for ₦{amount || "—"}. Complete payment,
            then return here. We will verify automatically.
          </Text>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.disabled]}
            onPress={() => runVerify(reference)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Payment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleCancelPending} disabled={loading}>
            <Text style={styles.linkText}>Didn't pay? Start new payment</Text>
          </TouchableOpacity>
        </View>
      )}
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
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#AAA", marginBottom: 30 },
  label: { color: "#CCC", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  inputLocked: { opacity: 0.7 },
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
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  verifySection: { marginTop: 8 },
  instruction: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  linkButton: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#A5B4FC", fontSize: 14 },
});