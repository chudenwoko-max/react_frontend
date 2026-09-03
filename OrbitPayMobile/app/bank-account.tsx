import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import axiosClient from "../src/api/axiosClient";
import { Ionicons } from "@expo/vector-icons";

export default function BankAccountScreen() {
  const router = useRouter();

  const [currentBank, setCurrentBank] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favUser, setFavUser] = useState("");
  const [favNick, setFavNick] = useState("");
  const [favError, setFavError] = useState("");
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bankRes = await axiosClient.get("bank/account/");
      const bank = bankRes.data;
      setCurrentBank(bank);

      if (!bank || !bank.bank_code) {
        setIsEditing(true);
        if (bank?.account_number) {
          setAccountNumber(bank.account_number);
        }
      } else {
        setIsEditing(false);
      }

      const banksRes = await axiosClient.get("banks/");
      const bankList = Array.isArray(banksRes.data)
        ? banksRes.data
        : banksRes.data?.data || [];
      setBanks(bankList);

      try {
        const favRes = await axiosClient.get("favorites/");
        const rows = Array.isArray(favRes.data)
          ? favRes.data
          : favRes.data.results || favRes.data.favorites || [];
        setFavorites(rows);
      } catch {
        setFavorites([]);
      }
    } catch (err) {
      console.log("Load bank error:", err);
      setCurrentBank(null);
      setIsEditing(true);
    } finally {
      setFetching(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setSelectedBank(null);
    setAccountNumber(currentBank?.account_number || "");
    setError("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedBank(null);
    setAccountNumber("");
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!selectedBank) {
      setError("Please select a bank");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setError("Please enter a valid 10-digit account number");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("bank/link/", {
        bank_name: selectedBank.name,
        bank_code: selectedBank.code,
        account_number: accountNumber,
      });
      setIsEditing(false);
      setSelectedBank(null);
      setAccountNumber("");
      await loadData();
      if (Platform.OS === "web") {
        window.alert("Bank account updated successfully");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Failed to update bank account"
      );
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async () => {
    if (!favUser.trim()) {
      setFavError("Enter a username");
      return;
    }
    setFavLoading(true);
    setFavError("");
    try {
      await axiosClient.post("favorites/add/", {
        recipient_username: favUser.trim(),
        nickname: favNick.trim(),
      });
      setFavUser("");
      setFavNick("");
      const favRes = await axiosClient.get("favorites/");
      const rows = Array.isArray(favRes.data)
        ? favRes.data
        : favRes.data.results || [];
      setFavorites(rows);
    } catch (e: any) {
      setFavError(e?.response?.data?.detail || "Could not add favorite");
    } finally {
      setFavLoading(false);
    }
  };

  const removeFavorite = async (id: number) => {
    try {
      await axiosClient.post(`favorites/${id}/remove/`);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (e: any) {
      setFavError(e?.response?.data?.detail || "Could not remove");
    }
  };

  const favLabel = (f: any) =>
    f.nickname ||
    f.recipient_username ||
    f.username ||
    f.recipient?.username ||
    "User";

  const favHandle = (f: any) =>
    f.recipient_username || f.username || f.recipient?.username || "";

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Bank Account</Text>

        {!isEditing && currentBank ? (
          <View style={styles.currentCard}>
            <Text style={styles.cardLabel}>Currently Linked</Text>
            <Text style={styles.bankName}>{currentBank.bank_name}</Text>
            <Text style={styles.accountNumber}>{currentBank.account_number}</Text>
            {currentBank.account_name ? (
              <Text style={styles.accountName}>{currentBank.account_name}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.changeButton,
                pressed && { opacity: 0.75 },
              ]}
              onPress={startEditing}
              hitSlop={12}
            >
              <Text style={styles.changeButtonText}>Change Bank Account</Text>
            </Pressable>
          </View>
        ) : null}

        {isEditing && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>
              {currentBank ? "Update Bank Account" : "Link Bank Account"}
            </Text>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Text style={styles.label}>Select Bank</Text>
            <Pressable
              style={({ pressed }) => [
                styles.selector,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setShowBankModal(true)}
              hitSlop={8}
            >
              <Text style={{ color: selectedBank ? "#fff" : "#888" }}>
                {selectedBank ? selectedBank.name : "Choose your bank"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#888" />
            </Pressable>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0123456789"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={10}
              value={accountNumber}
              onChangeText={(text) => {
                setAccountNumber(text);
                setError("");
              }}
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading && styles.disabled,
                pressed && { opacity: 0.75 },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentBank ? "Update Bank Account" : "Link Bank Account"}
                </Text>
              )}
            </Pressable>
            {currentBank && (
              <Pressable style={styles.cancelButton} onPress={cancelEditing}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        )}

        <Text style={styles.favTitle}>Saved recipients</Text>
        <Text style={styles.favHint}>OrbitPay users you send to often</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={favUser}
          onChangeText={setFavUser}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Nickname (optional)"
          placeholderTextColor="#888"
          value={favNick}
          onChangeText={setFavNick}
        />
        {favError ? <Text style={styles.favError}>{favError}</Text> : null}
        <Pressable
          style={[styles.button, favLoading && styles.disabled]}
          onPress={addFavorite}
          disabled={favLoading}
        >
          <Text style={styles.buttonText}>
            {favLoading ? "Adding…" : "Add favorite"}
          </Text>
        </Pressable>

        {favorites.length === 0 ? (
          <Text style={styles.favEmpty}>No saved recipients yet.</Text>
        ) : (
          favorites.map((f) => (
            <View key={f.id || f.pk} style={styles.favCard}>
              <Text style={styles.favName}>{favLabel(f)}</Text>
              <Text style={styles.favUser}>@{favHandle(f)}</Text>
              <Pressable onPress={() => removeFavorite(f.id)} hitSlop={8}>
                <Text style={styles.favRemove}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showBankModal}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <Pressable onPress={() => setShowBankModal(false)} hitSlop={12}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
          </View>
          <FlatList
            data={banks}
            keyExtractor={(item, index) => `${item.code}-${index}`}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.bankItem,
                  pressed && { backgroundColor: "#1E1E2F" },
                ]}
                onPress={() => {
                  setSelectedBank(item);
                  setShowBankModal(false);
                  setError("");
                }}
              >
                <Text style={styles.bankItemText}>{item.name}</Text>
              </Pressable>
            )}
            initialNumToRender={20}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    padding: 20,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F1A",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
  },
  currentCard: {
    backgroundColor: "#1E1E2F",
    borderRadius: 16,
    padding: 20,
  },
  cardLabel: { color: "#94A3B8", fontSize: 13, marginBottom: 8 },
  bankName: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 4 },
  accountNumber: { color: "#E2E8F0", fontSize: 16, marginBottom: 4 },
  accountName: { color: "#94A3B8", fontSize: 14, marginBottom: 20 },
  changeButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  changeButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  form: { marginTop: 8 },
  sectionTitle: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#7F1D1D",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: { color: "#FECACA", fontSize: 14, textAlign: "center" },
  label: { color: "#CCC", marginBottom: 8, fontSize: 14 },
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
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancelButton: { marginTop: 16, alignItems: "center", padding: 12 },
  cancelText: { color: "#94A3B8", fontSize: 15 },
  favTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 28,
    marginBottom: 4,
  },
  favHint: { color: "#94A3B8", marginBottom: 12 },
  favError: { color: "#FECACA", marginBottom: 8 },
  favEmpty: { color: "#94A3B8", marginTop: 12 },
  favCard: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  favName: { fontWeight: "700", color: "#fff" },
  favUser: { color: "#94A3B8", marginTop: 4 },
  favRemove: { color: "#F87171", marginTop: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    paddingTop: Platform.OS === "ios" ? 20 : 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  bankItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E2F",
  },
  bankItemText: { color: "#fff", fontSize: 16 },
});