import React, { forwardRef, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const menuItems = [
  { icon: "send", label: "Send Money", route: "/(tabs)/send", color: "#0284C7" },
  { icon: "plus", label: "Fund Wallet", route: "/(tabs)/fund", color: "#16A34A" },
  { icon: "cash-plus", label: "Request Money", route: "/request-money", color: "#D97706" },
  { icon: "piggy-bank", label: "Savings Goals", route: "/savings", color: "#7C3AED" },
  { icon: "receipt", label: "Bill Payments", route: "/bills", color: "#DC2626" },
  { icon: "currency-usd", label: "Converter", route: "/converter", color: "#0891B2" },
  { icon: "calendar-clock", label: "Scheduled", route: "/scheduled", color: "#4F46E5" },
  { icon: "credit-card", label: "Virtual Cards", route: "/virtual-cards", color: "#0F172A" },
  { icon: "bank", label: "Bank Account", route: "/bank-account", color: "#059669" },
  { icon: "shield-check", label: "KYC", route: "/kyc", color: "#B45309" },
  { icon: "lock", label: "Set PIN", route: "/set-pin", color: "#BE185D" },
  { icon: "account-edit", label: "Edit Profile", route: "/edit-profile", color: "#1E40AF" },
  { icon: "account-group", label: "Referral", route: "/referral", color: "#7C2D12" },
  { icon: "headset", label: "Support", route: "/support", color: "#0E7490" },
  { icon: "bell", label: "Notifications", route: "/notifications", color: "#6D28D9" },
  { icon: "bank-transfer-out", label: "Withdraw", route: "/withdraw", color: "#DC2626" },
  { icon: "two-factor-authentication", label: "2FA", route: "/two-factor", color: "#7C3AED" },
  { icon: "cash-clock", label: "Pending Requests", route: "/pending-requests", color: "#D97706" },
];

interface MoreSheetProps {
  onChange?: (index: number) => void;
}

const MoreSheet = forwardRef<BottomSheet, MoreSheetProps>(({ onChange }, ref) => {
  const snapPoints = useMemo(() => ["55%", "85%"], []);

  const handlePress = (route: string) => {
    // @ts-ignore
    ref?.current?.close();
    router.push(route as any);
  };

  const renderBackdrop = (backdropProps: any) => (
    <BottomSheetBackdrop
      {...backdropProps}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={onChange}                 // ← now properly forwarded
      backgroundStyle={{ backgroundColor: "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>More Features</Text>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => handlePress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color + "15" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default MoreSheet;

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "30%",
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    fontWeight: "500",
  },
});