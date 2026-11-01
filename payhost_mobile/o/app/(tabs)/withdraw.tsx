import WithdrawScreen from "../withdraw";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function WithdrawTabScreen() {
  return (
    <ScreenWithTabBar>
      <WithdrawScreen />
    </ScreenWithTabBar>
  );
}
