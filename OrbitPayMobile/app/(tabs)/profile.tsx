import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
  // Web-friendly confirmation
  const confirmed = window.confirm("Are you sure you want to logout?");

  if (confirmed) {
    logout()
      .then(() => {
        router.replace("/(auth)/login");
      })
      .catch((e) => {
        console.log("Logout error:", e);
        router.replace("/(auth)/login"); // force navigate even if error
      });
  }
};

  const menuItems = [
    { icon: "account-outline", label: "Edit Profile", onPress: () => router.push("/edit-profile") },
    { icon: "shield-check-outline", label: "Verify Identity (KYC)", onPress: () => router.push("/kyc") },
    { icon: "lock-outline", label: "Change PIN", onPress: () => router.push("/set-pin") },
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
    paddingBottom: 40, // extra space at the bottom
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
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
});