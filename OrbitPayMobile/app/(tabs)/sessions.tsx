import SessionsScreen from "../sessions";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function SessionsTabScreen() {
  return (
    <ScreenWithTabBar>
      <SessionsScreen />
    </ScreenWithTabBar>
  );
}
