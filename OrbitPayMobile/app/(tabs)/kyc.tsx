import KycScreen from "../kyc";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function KycTabScreen() {
  return (
    <ScreenWithTabBar>
      <KycScreen />
    </ScreenWithTabBar>
  );
}
