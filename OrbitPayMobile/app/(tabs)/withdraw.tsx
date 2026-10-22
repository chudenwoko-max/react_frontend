import WithdrawScreen from "../withdraw";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function WithdrawTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Withdraw" />
      <WithdrawScreen />
    </ScreenWithTabBar>
  );
}
