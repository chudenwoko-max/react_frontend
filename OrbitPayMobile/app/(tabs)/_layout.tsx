import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Tabs, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DeviceEventEmitter,
  View,
  ActivityIndicator,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import MoreSheet, { OPEN_MORE_MENU } from "../../src/components/MoreSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuth } from "../../src/context/AuthContext";
import { useBiometricLock } from "../../src/hooks/useBiometricLock";
import BiometricLockScreen from "../../src/components/BiometricLockScreen";
import PinModal from "../../src/components/PinModal";

function SheetTabButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);
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

  const toggleSheet = useCallback(() => {
    if (isSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.expand();
    }
  }, [isSheetOpen]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(OPEN_MORE_MENU, toggleSheet);
    return () => subscription.remove();
  }, [toggleSheet]);

  if (isLoading || isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

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
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
          },
          tabBarLabelStyle: { fontSize: 11 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" color={color} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="send"
          options={{
            title: "Send",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="send" color={color} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="bills"
          options={{
            title: "Airtime & Data",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cellphone" color={color} size={22} />
            ),
          }}
        />
        {/* CHANGE: Bills is its own tile. It opens the bills screen until electricity and cable are split out. */}
        <Tabs.Screen
          name="fund"
          options={{
            title: "Bills",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="file-document-outline" color={color} size={22} />
            ),
            tabBarButton: (props) => (
              <SheetTabButton
                style={props.style}
                onPress={() => router.push("/(tabs)/bills")}
              >
                {props.children}
              </SheetTabButton>
            ),
          }}
        />
        {/* CHANGE: Menu opens the existing sheet. It does not open wallet. */}
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Menu",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="menu" color={color} size={22} />
            ),
            tabBarButton: (props) => (
              <SheetTabButton style={props.style} onPress={toggleSheet}>
                {props.children}
              </SheetTabButton>
            ),
          }}
        />
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>

      <MoreSheet
        ref={bottomSheetRef}
        // @ts-ignore
        onChange={(index: number) => setIsSheetOpen(index >= 0)}
      />

      <PinModal
        visible={showPinModal}
        onSuccess={() => {
          setShowPinModal(false);
          unlockManually();
        }}
        onClose={() => setShowPinModal(false)}
        title="Enter Transaction PIN to Unlock"
      />
    </GestureHandlerRootView>
  );
}