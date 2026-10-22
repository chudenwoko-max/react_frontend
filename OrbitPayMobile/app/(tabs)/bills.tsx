import BillsScreen from "../bills";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function BillsTabScreen() {
  return (
    <ScreenWithTabBar>
      <BillsScreen />
    </ScreenWithTabBar>
  );
}
