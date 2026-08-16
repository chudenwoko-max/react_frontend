import { Stack } from "expo-router";
import { AuthProvider } from "../../src/context/AuthContext";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}