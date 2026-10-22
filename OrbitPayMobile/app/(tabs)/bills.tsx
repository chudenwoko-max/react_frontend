import BillsScreen from "../bills";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function BillsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Bill Payments" />
      <BillsScreen />
    </ScreenWithTabBar>
  );
}
