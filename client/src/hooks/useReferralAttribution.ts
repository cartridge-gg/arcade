import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  captureAttribution,
  getAttribution,
  type ReferralAttribution,
} from "@/lib/referral";

/**
 * Hook to manage referral attribution
 *
 * Auto-captures referral parameters from URL on mount and provides
 * access to current attribution state.
 *
 * @returns Current attribution state and validity
 */
export function useReferralAttribution() {
  const search = useSearch({ strict: false });
  const [attribution, setAttribution] = useState<ReferralAttribution | null>(
    null,
  );

  // Capture attribution on mount if URL params exist
  useEffect(() => {
    // Get search params from TanStack Router
    const searchParams = new URLSearchParams(
      typeof search === "object" ? (search as Record<string, string>) : {},
    );

    // Attempt to capture attribution
    captureAttribution(searchParams);

    // Load current attribution state
    const current = getAttribution();
    setAttribution(current);
  }, [search]);

  return {
    attribution,
    hasAttribution: !!attribution,
    referrer: attribution?.referrer,
    referrerGroup: attribution?.referrerGroup,
  };
}
