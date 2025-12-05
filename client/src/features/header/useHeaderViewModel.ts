import { useAnalytics } from "@/hooks/useAnalytics";
import { useCallback } from "react";

export interface HeaderViewModel {
  onLogoClick: () => void;
}

export function useHeaderViewModel(): HeaderViewModel {
  const { trackEvent, events } = useAnalytics();

  const onLogoClick = useCallback(() => {
    trackEvent(events.NAVIGATION_HOME_CLICKED, {
      from_page: window.location.pathname,
    });
  }, [trackEvent, events.NAVIGATION_HOME_CLICKED]);

  return { onLogoClick };
}
