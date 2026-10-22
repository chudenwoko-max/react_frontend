import ConverterScreen from "../converter";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function ConverterTabScreen() {
  return (
    <ScreenWithTabBar>
      <ConverterScreen />
    </ScreenWithTabBar>
  );
}
