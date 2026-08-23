import { useRef, useState } from "react";
import { Tabs, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import MoreSheet from "../../src/components/MoreSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuth } from "../../src/context/AuthContext";
import { useBiometricLock } from "../../src/hooks/useBiometricLock";
import BiometricLockScreen from "../../src/components/BiometricLockScreen";
import PinModal from "../../src/components/PinModal"; // ← Import your existing PIN modal component here

export default function TabsLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const { user, isLoading } = useAuth();
  const isLoggedIn = !!user;

  const {
    isLocked,
    isChecking,
    unlockWithBiometrics,
    unlockManually,
  } = useBiometricLock(isLoggedIn);

  const pathname = usePathname();

  // Strict check – only pure Home / Welcome page
  const isHomePage =
    pathname === "/" ||
    pathname === "/(tabs)" ||
    pathname === "/(tabs)/" ||
    pathname === "/(tabs)/index" ||
    pathname.endsWith("/index");

  const toggleSheet = () => {
    if (isSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.expand();
    }
  };

  // Loading state
  if (isLoading || isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  // Biometric Lock Screen
  if (isLoggedIn && isLocked) {
    return (
      <BiometricLockScreen
        onUnlockWithBiometrics={unlockWithBiometrics}
        onUsePin={() => setShowPinModal(true)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F172A",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="wallet" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen name="send" options={{ href: null }} />
        <Tabs.Screen name="fund" options={{ href: null }} />
      </Tabs>

      {/* Floating Menu Button – ONLY on Home page */}
      {isHomePage && (
        <View style={styles.menuContainer}>
          {showTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>MENU</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSheet}
            onPressIn={() => setShowTooltip(true)}
            onPressOut={() => setShowTooltip(false)}
            {...(Platform.OS === "web" && {
              onMouseEnter: () => setShowTooltip(true),
              onMouseLeave: () => setShowTooltip(false),
            })}
          >
            <MaterialCommunityIcons name="dots-grid" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <MoreSheet
        ref={bottomSheetRef}
        // @ts-ignore
        onChange={(index: number) => setIsSheetOpen(index >= 0)}
      />

      {/* ===== PIN Modal (connect your existing one) ===== */}
      <PinModal
        visible={showPinModal}
        onSuccess={() => {
          setShowPinModal(false);
          unlockManually(); // ← unlocks the app
        }}
        onClose={() => setShowPinModal(false)}
        title="Enter Transaction PIN to Unlock"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
    alignItems: "center",
  },
  menuButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  tooltip: {
    position: "absolute",
    top: 62,
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});