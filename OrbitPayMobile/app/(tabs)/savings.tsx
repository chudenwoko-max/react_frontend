import SavingsScreen from "../savings";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function SavingsTabScreen() {
  return (
    <ScreenWithTabBar>
      <SavingsScreen />
    </ScreenWithTabBar>
  );
}
