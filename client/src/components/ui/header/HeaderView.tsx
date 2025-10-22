import ArcadeHeader from "@/components/ui/modules/arcade-header";
import { ConnectionContainer } from "@/features/connection";
import type { HeaderViewModel } from "@/features/header/useHeaderViewModel";
import { SearchContainer } from "@/features/search";
import { NotificationsContainer } from "@/features/notifications";

export const HeaderView = ({ onLogoClick }: HeaderViewModel) => {
  return (
    <ArcadeHeader onLogoClick={onLogoClick}>
      <SearchContainer />
      <NotificationsContainer />
      <ConnectionContainer />
    </ArcadeHeader>
  );
};
