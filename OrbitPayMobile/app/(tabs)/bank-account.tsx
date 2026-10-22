import BankAccountScreen from "../bank-account";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function BankAccountTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Bank Account" />
      <BankAccountScreen />
    </ScreenWithTabBar>
  );
}
