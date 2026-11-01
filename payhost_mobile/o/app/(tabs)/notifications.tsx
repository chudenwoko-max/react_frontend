import NotificationsScreen from "../notifications";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function NotificationsTabScreen() {
  return (
    <ScreenWithTabBar>
      <NotificationsScreen />
    </ScreenWithTabBar>
  );
}
