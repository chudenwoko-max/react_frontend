import RequestMoneyScreen from "../request-money";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function RequestMoneyTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Request Money" />
      <RequestMoneyScreen />
    </ScreenWithTabBar>
  );
}
