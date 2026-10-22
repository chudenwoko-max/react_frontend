import ScheduledScreen from "../scheduled";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function ScheduledTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Scheduled Payments" />
      <ScheduledScreen />
    </ScreenWithTabBar>
  );
}
