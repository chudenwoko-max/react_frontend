import SetPinScreen from "../set-pin";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function SetPinTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Set PIN" />
      <SetPinScreen />
    </ScreenWithTabBar>
  );
}
