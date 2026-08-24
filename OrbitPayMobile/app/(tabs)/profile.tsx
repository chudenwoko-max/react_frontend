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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
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

  useEffect(() => {
    loadBiometricSettings();
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

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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