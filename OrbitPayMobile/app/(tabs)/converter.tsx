import ConverterScreen from "../converter";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function ConverterTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Currency Converter" />
      <ConverterScreen />
    </ScreenWithTabBar>
  );
}
