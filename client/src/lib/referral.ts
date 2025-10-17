/**
 * Referral Attribution System
 *
 * Captures and manages referral attribution from URL parameters.
 * Implements first-touch attribution with a 30-day window.
 */

const STORAGE_KEY = "arcade_referral_attribution";
const ATTRIBUTION_WINDOW_DAYS = 30;
const ATTRIBUTION_WINDOW_MS = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export interface ReferralAttribution {
  referrer: string;
  referrerGroup?: string;
  attributionTimestamp: string;
  attributionWindow: number;
}

/**
 * Check if an attribution is still valid (within the attribution window)
 */
export function isAttributionValid(timestamp: string): boolean {
  const attributionDate = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - attributionDate.getTime();
  return diff <= ATTRIBUTION_WINDOW_MS;
}

/**
 * Get current referral attribution from localStorage
 * Returns null if no attribution exists or if it has expired
 */
export function getAttribution(): ReferralAttribution | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const attribution: ReferralAttribution = JSON.parse(stored);

    // Check if attribution is still valid
    if (!isAttributionValid(attribution.attributionTimestamp)) {
      clearAttribution();
      return null;
    }

    return attribution;
  } catch (error) {
    console.error("Error reading referral attribution:", error);
    return null;
  }
}

/**
 * Capture referral attribution from URL search parameters
 * Implements first-touch attribution - will not overwrite existing valid attribution
 *
 * @param searchParams - URLSearchParams from the current URL
 * @returns true if attribution was captured, false if skipped (already exists)
 */
export function captureAttribution(searchParams: URLSearchParams): boolean {
  try {
    // Check if we already have valid attribution (first-touch model)
    const existing = getAttribution();
    if (existing) {
      console.log("Existing attribution found, skipping capture (first-touch model)");
      return false;
    }

    // Extract referral parameters
    const referrer = searchParams.get("ref");
    const referrerGroup = searchParams.get("ref_group");

    // Only capture if ref parameter exists
    if (!referrer) {
      return false;
    }

    const attribution: ReferralAttribution = {
      referrer,
      referrerGroup: referrerGroup || undefined,
      attributionTimestamp: new Date().toISOString(),
      attributionWindow: ATTRIBUTION_WINDOW_MS,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    console.log("Referral attribution captured:", attribution);
    return true;
  } catch (error) {
    console.error("Error capturing referral attribution:", error);
    return false;
  }
}

/**
 * Clear stored referral attribution
 */
export function clearAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing referral attribution:", error);
  }
}

/**
 * Get attribution window information
 */
export function getAttributionWindowInfo() {
  return {
    windowDays: ATTRIBUTION_WINDOW_DAYS,
    windowMs: ATTRIBUTION_WINDOW_MS,
  };
}
