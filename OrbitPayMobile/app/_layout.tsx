import { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { initializeSslPinning } from "react-native-ssl-public-key-pinning";

async function setupSslPinning() {
  // SSL Pinning only works on native (iOS / Android)
  if (Platform.OS === "web") return;

  try {
    await initializeSslPinning({
  "currency-cvt-fintech-1.onrender.com": {
    includeSubdomains: false,
    publicKeyHashes: [
      "fizfE9JVlzlRplEx7epXfqW9enrbLvwF/LU26XTPEG4=", // Leaf
      "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=", // Intermediate
      "mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=", // Intermediate (extra backup)
    ],
  },
});
    console.log("✅ SSL Pinning initialized successfully");
  } catch (error) {
    console.warn("SSL Pinning initialization failed:", error);
  }
}

export default function RootLayout() {
  useEffect(() => {
    setupSslPinning();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}