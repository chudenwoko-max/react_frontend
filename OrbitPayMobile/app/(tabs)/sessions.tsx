import SessionsScreen from "../sessions";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function SessionsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Sessions" />
      <SessionsScreen />
    </ScreenWithTabBar>
  );
}
