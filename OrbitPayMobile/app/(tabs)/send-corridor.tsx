import SendCorridorScreen from "../send-corridor";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function SendCorridorTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Send Abroad" />
      <SendCorridorScreen />
    </ScreenWithTabBar>
  );
}
