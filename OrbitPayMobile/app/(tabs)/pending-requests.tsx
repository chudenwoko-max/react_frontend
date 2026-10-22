import PendingRequestsScreen from "../pending-requests";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function PendingRequestsTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Pending Requests" />
      <PendingRequestsScreen />
    </ScreenWithTabBar>
  );
}
