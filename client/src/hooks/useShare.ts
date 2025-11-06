import { useCallback, useMemo } from "react";
import { useAnalytics } from "./useAnalytics";

export interface ShareConfig {
  title: string;
  text: string;
  url: string;
  analyticsEvent?: {
    name: string;
    properties?: Record<string, any>;
  };
}

export function useShare(config: ShareConfig) {
  const { trackEvent } = useAnalytics();

  const isShareAvailable = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.share;
  }, []);

  const handleShare = useCallback(async () => {
    const { title, text, url, analyticsEvent } = config;

    const shareData = {
      title,
      text,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (analyticsEvent) {
          trackEvent(analyticsEvent.name, {
            ...analyticsEvent.properties,
            method: "native",
          });
        }
      } else {
        await navigator.clipboard.writeText(url);
        if (analyticsEvent) {
          trackEvent(analyticsEvent.name, {
            ...analyticsEvent.properties,
            method: "clipboard",
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  }, [config, trackEvent]);

  return {
    handleShare,
    isShareAvailable,
  };
}
