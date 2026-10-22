import EditProfileScreen from "../edit-profile";
import { ScreenWithTabBar } from "../../src/components/ScreenWithTabBar";
import MenuHeader from "../../src/components/MenuHeader";

export default function EditProfileTabScreen() {
  return (
    <ScreenWithTabBar>
      <MenuHeader title="Edit Profile" />
      <EditProfileScreen />
    </ScreenWithTabBar>
  );
}
