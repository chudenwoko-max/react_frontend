import RequestMoneyScreen from "../request-money";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function RequestMoneyTabScreen() {
  return (
    <ScreenWithTabBar>
      <RequestMoneyScreen />
    </ScreenWithTabBar>
  );
}
