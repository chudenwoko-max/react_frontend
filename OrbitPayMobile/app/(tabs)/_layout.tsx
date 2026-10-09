import { useRef, useState } from "react";
import { Tabs, usePathname, router } from "expo-router";
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
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F172A",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
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
          tabBarLabelStyle: { fontSize: 11 },
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
          name="send"
          options={{
            title: "Send",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="send" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bills"
          options={{
            title: "Airtime & Data",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cellphone" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="fund"
          options={{
            title: "Bills",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity style={props.style} onPress={() => router.push("/(tabs)/bills")}>
                {props.children}
              </TouchableOpacity>
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
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
      <MoreSheet
        ref={bottomSheetRef}
        onChange={(index) => setIsSheetOpen(index >= 0)}
      />
      </>
  );
}