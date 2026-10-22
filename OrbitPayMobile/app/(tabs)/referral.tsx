import ReferralScreen from "../referral";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function ReferralTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Referral" />
      <ReferralScreen />
    </ScreenWithTabBar>
  );
}
