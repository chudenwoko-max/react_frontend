import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type ScreenWithTabBarProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenWithTabBar({ children, style }: ScreenWithTabBarProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 88,
    backgroundColor: "#FFFFFF",
  },
});
