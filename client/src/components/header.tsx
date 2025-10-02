import { Link } from "@tanstack/react-router";
import { Connection } from "./connection";
import ArcadeHeader from "./modules/arcade-header";
import { useAnalytics } from "@/hooks/useAnalytics";

type HeaderProps = {};

export const Header = ({}: HeaderProps) => {
  const { trackEvent, events } = useAnalytics();

  const handleLogoClick = () => {
    trackEvent(events.NAVIGATION_HOME_CLICKED, {
      from_page: window.location.pathname,
    });
  };

  return (
    <Link to="/" onClick={handleLogoClick}>
      <ArcadeHeader>
        <Connection />
      </ArcadeHeader>
    </Link>
  );
};
