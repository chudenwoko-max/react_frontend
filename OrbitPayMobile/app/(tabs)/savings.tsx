import SavingsScreen from "../savings";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function SavingsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Savings Goals" />
      <SavingsScreen />
    </ScreenWithTabBar>
  );
}
