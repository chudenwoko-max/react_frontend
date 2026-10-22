import BankAccountScreen from "../bank-account";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function BankAccountTabScreen() {
  return (
    <ScreenWithTabBar>
      <BankAccountScreen />
    </ScreenWithTabBar>
  );
}
