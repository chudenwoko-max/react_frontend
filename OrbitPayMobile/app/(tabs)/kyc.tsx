import KycScreen from "../kyc";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function KycTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="KYC" />
      <KycScreen />
    </ScreenWithTabBar>
  );
}
