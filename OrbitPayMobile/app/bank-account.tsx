import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { router } from "expo-router";
import axiosClient from "../src/api/axiosClient";

export default function BankAccountScreen() {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingAccount, setExistingAccount] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axiosClient.get("bank/account/");
        setExistingAccount(res.data);
      } catch (err) {
        // No bank account linked yet
        setExistingAccount(null);
      } finally {
        setFetching(false);
      }
    };
    fetchAccount();
  }, []);

  const handleLink = async () => {
  if (!accountNumber || !bankName || !accountName) {
    setError("Please fill in all fields");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await axiosClient.post("bank/link/", {
      account_number: accountNumber,
      bank_name: bankName,
      account_name: accountName,
    });

    window.alert("Bank account linked successfully!");
    router.back();
  } catch (err: any) {
    console.log("Bank link error:", err.response?.data);
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Failed to link bank account. Please try again.";
    setError(message);
  } finally {
    setLoading(false);
  }
};
  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Bank Account</Text>
      <Text style={styles.subtitle}>
        Link your bank account for withdrawals
      </Text>

      {existingAccount ? (
        <View style={styles.existingCard}>
          <Text style={styles.existingLabel}>Linked Account</Text>
          <Text style={styles.existingValue}>
            {existingAccount.account_name || existingAccount.accountName}
          </Text>
          <Text style={styles.existingSub}>
            {existingAccount.bank_name || existingAccount.bankName} •{" "}
            {existingAccount.account_number || existingAccount.accountNumber}
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            label="Account Name"
            value={accountName}
            onChangeText={setAccountName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Bank Name"
            value={bankName}
            onChangeText={setBankName}
            mode="outlined"
            style={styles.input}
          />

          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLink}
            loading={loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            Link Bank Account
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    padding: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
  },
  existingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  existingLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  existingValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  existingSub: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
});