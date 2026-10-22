import NotificationsScreen from "../notifications";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function NotificationsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Notifications" />
      <NotificationsScreen />
    </ScreenWithTabBar>
  );
}
