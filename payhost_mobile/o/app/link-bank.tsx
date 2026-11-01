import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { Ionicons } from "@expo/vector-icons";

export default function LinkBankScreen() {
  const router = useRouter();
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBanks, setFetchingBanks] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await axiosClient.get("banks/");
      setBanks(res.data || []);
    } catch (error) {
      Alert.alert("Error", "Could not load banks");
    } finally {
      setFetchingBanks(false);
    }
  };

  const resolveAccount = async () => {
    if (!selectedBank || accountNumber.length < 10) return;

    setResolving(true);
    try {
      // We can resolve on the backend, but for better UX we can also do it here if you expose an endpoint
      // For now we just clear previous name
      setAccountName("");
    } catch (error) {
      console.log(error);
    } finally {
      setResolving(false);
    }
  };

  const handleLinkBank = async () => {
  if (!selectedBank) {
    Alert.alert("Error", "Please select a bank");
    return;
  }
  if (!accountNumber || accountNumber.length < 10) {
    Alert.alert("Error", "Please enter a valid 10-digit account number");
    return;
  }

  setLoading(true);
  try {
    const res = await axiosClient.post("bank/link/", {
      bank_name: selectedBank.name,
      bank_code: selectedBank.code,
      account_number: accountNumber,
      account_name: accountName || undefined,
    });

    Alert.alert("Success", "Bank account linked successfully", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  } catch (error: any) {
    Alert.alert(
      "Error",
      error?.response?.data?.error || "Failed to link bank account"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link Bank Account</Text>
      <Text style={styles.subtitle}>
        Add your bank account to withdraw funds
      </Text>

      {/* Bank Selector */}
      <Text style={styles.label}>Select Bank</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowBankModal(true)}
      >
        <Text style={{ color: selectedBank ? "#fff" : "#888" }}>
          {selectedBank ? selectedBank.name : "Choose your bank"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>

      {/* Account Number */}
      <Text style={styles.label}>Account Number</Text>
      <TextInput
        style={styles.input}
        placeholder="0123456789"
        placeholderTextColor="#888"
        keyboardType="number-pad"
        maxLength={10}
        value={accountNumber}
        onChangeText={setAccountNumber}
        onBlur={resolveAccount}
      />

      {/* Account Name (optional display) */}
      {accountName ? (
        <View style={styles.resolvedBox}>
          <Text style={styles.resolvedLabel}>Account Name</Text>
          <Text style={styles.resolvedName}>{accountName}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleLinkBank}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Link Bank Account</Text>
        )}
      </TouchableOpacity>

      {/* Bank Selection Modal */}
      <Modal visible={showBankModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {fetchingBanks ? (
            <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={banks}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankModal(false);
                  }}
                >
                  <Text style={styles.bankName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
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
  selector: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  resolvedBox: {
    backgroundColor: "#102A1F",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  resolvedLabel: {
    color: "#10B981",
    fontSize: 12,
    marginBottom: 4,
  },
  resolvedName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  bankItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E2F",
  },
  bankName: {
    color: "#fff",
    fontSize: 16,
  },
});