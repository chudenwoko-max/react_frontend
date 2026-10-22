import PendingRequestsScreen from "../pending-requests";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";

export default function PendingRequestsTabScreen() {
  return (
    <ScreenWithTabBar>
      <PendingRequestsScreen />
    </ScreenWithTabBar>
  );
}
