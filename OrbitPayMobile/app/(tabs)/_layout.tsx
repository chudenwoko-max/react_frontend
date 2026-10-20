import { useRef, useState, type ReactNode } from "react";
import { Tabs, usePathname, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import MoreSheet from "../../src/components/MoreSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";

import { useAuth } from "../../src/context/AuthContext";
import { useBiometricLock } from "../../src/hooks/useBiometricLock";
import BiometricLockScreen from "../../src/components/BiometricLockScreen";
import PinModal from "../../src/components/PinModal"; // ← Import your existing PIN modal component here
import UnlockWallet from "../../src/components/UnlockWallet";

function TabPress({
  style,
  children,
  onPress,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const { user, isLoading, completeLogin, refreshProfile, logout } = useAuth();
  const isLoggedIn = !!user;

  const {
    isLocked,
    isChecking,
    unlockWithBiometrics,
    unlockManually,
    recordActivity,
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

  const handleWalletUnlocked = async (response: { data: Record<string, unknown> }) => {
    try {
      await SecureStore.deleteItemAsync("WALLET_FROZEN");
    } catch (error) {
      console.error("Could not clear saved wallet lock state:", error);
    }
    const access = response.data.access;
    const refresh = response.data.refresh;

    if (typeof access === "string" && typeof refresh === "string") {
      try {
        await completeLogin(access, refresh);
      } catch (error) {
        console.error("Wallet unlocked, but automatic sign-in failed:", error);
      }
    }

    try {
      const profile = await refreshProfile();
      if (!profile?.is_frozen) {
        router.replace("/(tabs)");
        return true;
      }
      return false;
    } catch (error) {
      console.log("Wallet unlocked; session needs sign-in:", error);
    }

    try {
      await logout();
    } catch (error) {
      console.error("Could not clear the signed-out session:", error);
    }
    router.replace("/(auth)/login");
    return true;
  };

  // Loading state
  if (isLoading || isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (isLoggedIn && user?.is_frozen) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F8FAFC" }}>
        <UnlockWallet onUnlocked={handleWalletUnlocked} />
      </View>
    );
  }

  // Biometric Lock Screen
  if (isLoggedIn && isLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BiometricLockScreen
          onUnlockWithBiometrics={unlockWithBiometrics}
          onUsePin={() => setShowPinModal(true)}
        />
        <PinModal
          visible={showPinModal}
          onSuccess={() => {
            setShowPinModal(false);
            unlockManually();
          }}
          onClose={() => setShowPinModal(false)}
          title="Enter PIN to unlock Payhost"
        />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      onTouchStart={recordActivity}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F172A",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            height: 72,
            paddingBottom: 12,
            paddingTop: 6,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            elevation: 100,
          },
          tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TabPress
                style={props.style}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  router.push("/(tabs)");
                }}
              >
                {props.children}
              </TabPress>
            ),
          }}
        />
        <Tabs.Screen
          name="send"
          options={{
            title: "Send",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="send" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TabPress
                style={props.style}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  router.push("/(tabs)/send");
                }}
              >
                {props.children}
              </TabPress>
            ),
          }}
        />
        <Tabs.Screen
          name="bills"
          options={{
            title: "Airtime & Bills",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cellphone" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TabPress
                style={props.style}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  router.push("/(tabs)/bills");
                }}
              >
                {props.children}
              </TabPress>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="history" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TabPress
                style={props.style}
                onPress={() => {
                  bottomSheetRef.current?.close();
                  router.push("/(tabs)/history");
                }}
              >
                {props.children}
              </TabPress>
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Menu",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="menu" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity style={props.style} onPress={toggleSheet}>
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen name="fund" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="request-money" options={{ href: null }} />
        <Tabs.Screen name="savings" options={{ href: null }} />
        <Tabs.Screen name="converter" options={{ href: null }} />
        <Tabs.Screen name="scheduled" options={{ href: null }} />
        <Tabs.Screen name="virtual-cards" options={{ href: null }} />
        <Tabs.Screen name="bank-account" options={{ href: null }} />
        <Tabs.Screen name="send-corridor" options={{ href: null }} />
        <Tabs.Screen name="kyc" options={{ href: null }} />
        <Tabs.Screen name="set-pin" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="referral" options={{ href: null }} />
        <Tabs.Screen name="support" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="withdraw" options={{ href: null }} />
        <Tabs.Screen name="two-factor" options={{ href: null }} />
        <Tabs.Screen name="pending-requests" options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ href: null }} />
        <Tabs.Screen name="legal" options={{ href: null }} />
      </Tabs>
      <MoreSheet
        ref={bottomSheetRef}
        onChange={(index) => setIsSheetOpen(index >= 0)}
      />
    </GestureHandlerRootView>
  );
}