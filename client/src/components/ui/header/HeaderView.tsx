import { Link } from "@tanstack/react-router";
import ArcadeHeader from "@/components/ui/modules/arcade-header";
import { ConnectionContainer } from "@/features/connection";
import type { HeaderViewModel } from "@/features/header/useHeaderViewModel";

export const HeaderView = ({ onLogoClick }: HeaderViewModel) => {
  return (
    <Link to="/" onClick={onLogoClick}>
      <ArcadeHeader>
        <ConnectionContainer />
      </ArcadeHeader>
    </Link>
  );
};
