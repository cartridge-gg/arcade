import { useNavigate } from "@tanstack/react-router";
import { Connection } from "./connection";
import ArcadeHeader from "./modules/arcade-header";
import { useAnalytics } from "@/hooks/useAnalytics";

type HeaderProps = {};

export const Header = ({}: HeaderProps) => {
  const navigate = useNavigate();
  const { trackEvent, events } = useAnalytics();

  const handleLogoClick = () => {
    trackEvent(events.NAVIGATION_HOME_CLICKED, {
      from_page: window.location.pathname,
    });
    navigate({ to: "/" });
  };

  return (
    <ArcadeHeader onClick={handleLogoClick}>
      <Connection />
    </ArcadeHeader>
  );
};
