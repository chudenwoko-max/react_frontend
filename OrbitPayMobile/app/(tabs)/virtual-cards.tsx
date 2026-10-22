import VirtualCardsScreen from "../virtual-cards";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function VirtualCardsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Virtual Cards" />
      <VirtualCardsScreen />
    </ScreenWithTabBar>
  );
}
