import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const amount = params.amount || "0";
  const newBalance = params.new_balance || "0";
  const reference = params.reference || "";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={90} color="#10B981" />
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Your wallet has been credited</Text>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount Funded</Text>
          <Text style={styles.amount}>
            ₦{Number(amount).toLocaleString()}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>New Balance</Text>
            <Text style={styles.value}>
              ₦{Number(newBalance).toLocaleString()}
            </Text>
          </View>

          {reference ? (
            <View style={styles.row}>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{reference}</Text>
            </View>
          ) : null}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/wallet")}
        >
          <Text style={styles.primaryButtonText}>Go to Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#A0A0B0",
    marginBottom: 28,
  },
  amountBox: {
    backgroundColor: "#102A1F",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#10B98133",
  },
  amountLabel: {
    color: "#10B981",
    fontSize: 14,
    marginBottom: 6,
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  details: {
    width: "100%",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  label: {
    color: "#A0A0B0",
    fontSize: 15,
  },
  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#6C63FF",
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 14,
  },
  secondaryButtonText: {
    color: "#A0A0B0",
    fontSize: 15,
  },
});