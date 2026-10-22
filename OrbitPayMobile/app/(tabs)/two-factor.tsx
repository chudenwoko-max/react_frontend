import TwoFactorScreen from "../two-factor";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function TwoFactorTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Two-Factor Authentication" />
      <TwoFactorScreen />
    </ScreenWithTabBar>
  );
}
