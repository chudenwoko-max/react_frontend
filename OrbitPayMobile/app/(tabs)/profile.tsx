import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import axiosClient from "../../src/api/axiosClient";
import { router } from "expo-router";
import { isAxiosError } from "axios";
import {
  getBiometricStatus,
  isBiometricEnabled,
  setBiometricEnabled,
  authenticateWithBiometrics,
  BiometricStatus,
} from "../../src/utils/biometric"; // ← adjust path if needed

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [loadingBiometric, setLoadingBiometric] = useState(true);
  const [kycStatus, setKycStatus] = useState("unverified");
  const [kycLimits, setKycLimits] = useState<any>(null);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [lockingWallet, setLockingWallet] = useState(false);
  const [lockError, setLockError] = useState("");

  useEffect(() => {
    loadBiometricSettings();
  }, []);

    useEffect(() => {
    axiosClient
      .get("kyc/")
      .then((res) => {
        setKycStatus(String(res.data.status || "unverified").toLowerCase());
        setKycLimits(res.data.limits || null);
      })
      .catch(() => {});
  }, []);

  const loadBiometricSettings = async () => {
    try {
      const status = await getBiometricStatus();
      const enabled = await isBiometricEnabled();
      setBiometricStatus(status);
      setBiometricEnabledState(enabled);
    } catch (e) {
      console.log("Biometric load error:", e);
    } finally {
      setLoadingBiometric(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      // Turning ON
      if (!biometricStatus?.canUseBiometrics) {
        Alert.alert(
          "Not Available",
          biometricStatus?.hasHardware
            ? "Please enroll Face ID / Fingerprint in your device Settings first."
            : "This device does not support biometrics."
        );
        return;
      }

      const result = await authenticateWithBiometrics(
        `Confirm to enable ${biometricStatus.label} unlock`
      );

      if (!result.success) {
        Alert.alert("Failed", result.error || "Could not enable biometric unlock");
        return;
      }

      await setBiometricEnabled(true);
      setBiometricEnabledState(true);
      Alert.alert("Success", `${biometricStatus.label} unlock enabled`);
    } else {
      // Turning OFF
      await setBiometricEnabled(false);
      setBiometricEnabledState(false);
    }
  };

  const handleLockWallet = async () => {
    if (lockingWallet) return;

    const pin = lockPin.trim();
    if (!pin) {
      setLockError("Enter your PIN to lock your wallet.");
      return;
    }

    setLockingWallet(true);
    setLockError("");
    try {
      await axiosClient.post("wallet/lock/", { pin });
    } catch (error) {
      const data = isAxiosError<
        { error?: string; detail?: string; message?: string } | string
      >(error)
        ? error.response?.data
        : undefined;
      const message =
        typeof data === "string"
          ? data
          : data?.error || data?.detail || data?.message;
      setLockError(message || "Could not lock wallet. Please try again.");
      setLockingWallet(false);
      return;
    }

    setLockModalVisible(false);
    setLockPin("");
    let localLogoutFailed = false;
    try {
      await logout();
    } catch (error) {
      localLogoutFailed = true;
      console.log("Wallet locked, but local logout failed:", error);
    }
    setLockingWallet(false);
    router.replace("/(auth)/login");
    Alert.alert(
      "Wallet locked",
      localLogoutFailed
        ? "Your wallet is locked and all sessions have been signed out, but this device could not clear its saved sign-in. Please restart the app."
        : "All sessions have been signed out. A confirmation email has been sent."
    );
  };

  const handleLogout = () => {
    const doLogout = () => {
      logout()
        .then(() => {
          router.replace("/(auth)/login");
        })
        .catch((e) => {
          console.log("Logout error:", e);
          router.replace("/(auth)/login");
        });
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) doLogout();
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: doLogout },
        ]
      );
    }
  };

  const menuItems = [
    { icon: "account-outline", label: "Edit Profile", onPress: () => router.push("/edit-profile") },
    { icon: "shield-check-outline", label: "Verify Identity (KYC)", onPress: () => router.push("/kyc") },
    { icon: "lock-outline", label: "Change PIN", onPress: () => router.push("/set-pin") },
    { icon: "devices", label: "Active Sessions", onPress: () => router.push("/sessions") },
    { icon: "bank-outline", label: "Bank Account", onPress: () => router.push("/bank-account") },
    { icon: "earth", label: "Send abroad", onPress: () => router.push("/send-corridor") },

    { icon: "credit-card-outline", label: "Virtual Cards", onPress: () => router.push("/virtual-cards") },
    { icon: "piggy-bank-outline", label: "Savings Goals", onPress: () => router.push("/savings") },
    { icon: "receipt", label: "Bill Payments", onPress: () => router.push("/bills") },
    { icon: "currency-usd", label: "Currency Converter", onPress: () => router.push("/converter") },
    { icon: "calendar-clock", label: "Scheduled Transfers", onPress: () => router.push("/scheduled") },
    { icon: "account-group", label: "Referral", onPress: () => router.push("/referral") },
    { icon: "headset", label: "Support", onPress: () => router.push("/support") },
    { icon: "bell-outline", label: "Notifications", onPress: () => router.push("/notifications") },
    { icon: "two-factor-authentication", label: "Two-Factor Auth", onPress: () => router.push("/two-factor") },
       
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email || "No email"}</Text>
      </View>

      {/* Biometric Unlock Card */}
<View style={styles.biometricCard}>
  <View style={styles.biometricLeft}>
    <MaterialCommunityIcons
      name="fingerprint"
      size={24}
      color="#0F172A"
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.biometricTitle}>
        Unlock with {biometricStatus?.label || "Biometrics"}
      </Text>
      <Text style={styles.biometricSubtitle}>
        {loadingBiometric
          ? "Checking device..."
          : Platform.OS === "web"
          ? "Biometric unlock is only available on mobile devices"
          : biometricStatus?.canUseBiometrics
          ? "Use fingerprint or face to unlock the app"
          : "Not available on this device"}
      </Text>
    </View>
  </View>

  {loadingBiometric ? (
    <ActivityIndicator size="small" color="#64748B" />
  ) : Platform.OS === "web" ? (
    <View style={styles.webBadge}>
      <Text style={styles.webBadgeText}>Mobile only</Text>
    </View>
  ) : (
    <Switch
      value={biometricEnabled}
      onValueChange={handleToggleBiometric}
      disabled={!biometricStatus?.canUseBiometrics}
      trackColor={{ false: "#E2E8F0", true: "#0F172A" }}
      thumbColor="#FFFFFF"
    />
  )}
</View>

      <TouchableOpacity
        onPress={() => router.push("/kyc")}
        style={{
          backgroundColor: "#F1F5F9",
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "700", color: "#0F172A" }}>
          {kycStatus === "approved"
            ? "Verified"
            : kycStatus === "pending"
            ? "KYC pending"
            : kycStatus === "rejected"
            ? "KYC rejected"
            : "Verify identity"}
        </Text>
        {kycLimits ? (
          <Text style={{ color: "#64748B", marginTop: 4 }}>
            ₦{Number(kycLimits.single_send_ngn).toLocaleString()} per send · ₦
            {Number(kycLimits.daily_send_ngn).toLocaleString()} / day
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={22}
                color="#475569"
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        style={styles.lockWalletButton}
        onPress={() => {
          setLockError("");
          setLockModalVisible(true);
        }}
      >
        <MaterialCommunityIcons name="lock-alert-outline" size={20} color="#B91C1C" />
        <View style={styles.lockWalletCopy}>
          <Text style={styles.lockWalletTitle}>Lock wallet now</Text>
          <Text style={styles.lockWalletSubtitle}>
            Freeze your wallet and sign out all sessions
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#B91C1C" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={lockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!lockingWallet) setLockModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.lockDialog}>
            <Text style={styles.lockDialogTitle}>Lock wallet now?</Text>
            <Text style={styles.lockDialogText}>
              Your wallet will be frozen immediately, all sessions will be signed
              out, and a confirmation email will be sent.
            </Text>
            <TextInput
              accessibilityLabel="Wallet PIN"
              style={styles.pinInput}
              placeholder="Enter your PIN"
              keyboardType="number-pad"
              secureTextEntry
              value={lockPin}
              onChangeText={setLockPin}
              editable={!lockingWallet}
              returnKeyType="done"
              onSubmitEditing={handleLockWallet}
            />
            {lockError ? <Text style={styles.lockError}>{lockError}</Text> : null}
            <View style={styles.lockDialogActions}>
              <TouchableOpacity
                style={styles.cancelLockButton}
                disabled={lockingWallet}
                onPress={() => {
                  setLockPin("");
                  setLockError("");
                  setLockModalVisible(false);
                }}
              >
                <Text style={styles.cancelLockText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmLockButton}
                disabled={lockingWallet}
                onPress={handleLockWallet}
              >
                {lockingWallet ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmLockText}>Lock wallet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  email: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  // Biometric card
  biometricCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  biometricLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    marginRight: 12,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  biometricSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuLabel: {
    fontSize: 16,
    color: "#0F172A",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  lockWalletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  lockWalletCopy: {
    flex: 1,
  },
  lockWalletTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B91C1C",
  },
  lockWalletSubtitle: {
    fontSize: 13,
    color: "#7F1D1D",
    marginTop: 3,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  lockDialog: {
    padding: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  lockDialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  lockDialogText: {
    color: "#475569",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  lockError: {
    color: "#B91C1C",
    marginTop: 8,
  },
  lockDialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelLockButton: {
    justifyContent: "center",
    paddingHorizontal: 16,
    minHeight: 44,
  },
  cancelLockText: {
    color: "#475569",
    fontWeight: "600",
  },
  confirmLockButton: {
    minWidth: 112,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#B91C1C",
    borderRadius: 10,
  },
  confirmLockText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  webBadge: {
  backgroundColor: "#E2E8F0",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
},
webBadgeText: {
  fontSize: 12,
  color: "#64748B",
  fontWeight: "600",
},
});