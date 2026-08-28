import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { Platform } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { initializeSslPinning } from "react-native-ssl-public-key-pinning";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  getNotificationRoute,
} from "../src/notifications/push";

Sentry.init({
  dsn: "https://4f64489cf6806e487c89c606372d43ce@o4511941551652864.ingest.de.sentry.io/4511941563121744",
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  environment: __DEV__ ? "development" : "production",
  debug: __DEV__,
});

async function setupSslPinning() {
  if (Platform.OS === "web") return;

  try {
    await initializeSslPinning({
      "currency-cvt-fintech-1.onrender.com": {
        includeSubdomains: false,
        publicKeyHashes: [
          "fizfE9JVlzlRplEx7epXfqW9enrbLvwF/LU26XTPEG4=",
          "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=",
          "mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=",
        ],
      },
    });
    console.log("✅ SSL Pinning initialized successfully");
  } catch (error) {
    console.warn("SSL Pinning initialization failed:", error);
  }
}
function PushBootstrap() {
  const auth = useAuth() as { user?: unknown };
  const isLoggedIn = Boolean(auth?.user);

  useEffect(() => {
    if (Platform.OS === "web") return;

    Notifications.getLastNotificationResponseAsync().then((res) => {
      if (!res) return;
      const data = res.notification.request.content.data as Record<string, any>;
      router.push(getNotificationRoute(data) as any);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!isLoggedIn) return;

    registerForPushNotificationsAsync();

    const received = Notifications.addNotificationReceivedListener(() => {});
    const response = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data as Record<string, any>;
      router.push(getNotificationRoute(data) as any);
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [isLoggedIn]);

  return null;
}

function RootLayout() {
  useEffect(() => {
    setupSslPinning();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <PushBootstrap />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);