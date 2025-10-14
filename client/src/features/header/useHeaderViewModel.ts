import { useAnalytics } from "@/hooks/useAnalytics";

export interface HeaderViewModel {
  onLogoClick: () => void;
}

export function useHeaderViewModel(): HeaderViewModel {
  const { trackEvent, events } = useAnalytics();

  const onLogoClick = () => {
    trackEvent(events.NAVIGATION_HOME_CLICKED, {
      from_page: window.location.pathname,
    });
  };

  return { onLogoClick };
}
