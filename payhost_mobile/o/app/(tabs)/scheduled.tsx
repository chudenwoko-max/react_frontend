import ScheduledScreen from "../scheduled";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function ScheduledTabScreen() {
  return (
    <ScreenWithTabBar>
      <ScheduledScreen />
    </ScreenWithTabBar>
  );
}
