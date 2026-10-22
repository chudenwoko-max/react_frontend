import VirtualCardsScreen from "../virtual-cards";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function VirtualCardsTabScreen() {
  return (
    <ScreenWithTabBar>
      <VirtualCardsScreen />
    </ScreenWithTabBar>
  );
}
