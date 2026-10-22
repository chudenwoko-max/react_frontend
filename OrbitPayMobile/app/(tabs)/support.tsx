import SupportScreen from "../support";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function SupportTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Support" />
      <SupportScreen />
    </ScreenWithTabBar>
  );
}
