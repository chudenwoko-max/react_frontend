import TwoFactorScreen from "../two-factor";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function TwoFactorTabScreen() {
  return (
    <ScreenWithTabBar>
      <TwoFactorScreen />
    </ScreenWithTabBar>
  );
}
