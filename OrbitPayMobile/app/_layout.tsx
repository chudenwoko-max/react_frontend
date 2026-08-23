import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext"; // adjust path if needed
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function RootLayout() {
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