import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </PaperProvider>
    </AuthProvider>
  );
}