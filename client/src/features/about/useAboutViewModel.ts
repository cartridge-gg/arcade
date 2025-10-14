import { useMemo } from "react";
import type { EditionModel } from "@cartridge/arcade";

interface SocialLinks {
  website?: string;
  discord?: string;
  telegram?: string;
  twitter?: string;
  github?: string;
  youtube?: string;
}

export interface AboutViewModel {
  mediaItems: string[];
  details: string;
  socials?: SocialLinks;
  hasSocials: boolean;
}

export function useAboutViewModel({
  edition,
  socials,
}: {
  edition: EditionModel;
  socials?: SocialLinks;
}): AboutViewModel {
  const mediaItems = useMemo(() => {
    if (!edition) return [];
    const videos = edition.socials.videos?.filter(Boolean) ?? [];
    const images = edition.socials.images?.filter(Boolean) ?? [];
    return [...videos, ...images];
  }, [edition]);

  const details = edition?.description || "";

  const mergedSocials = useMemo(() => {
    if (!socials) return undefined;
    return socials;
  }, [socials]);

  const hasSocials = Boolean(
    mergedSocials &&
      Object.values(mergedSocials).some((value) => Boolean(value)),
  );

  return {
    mediaItems,
    details,
    socials: mergedSocials,
    hasSocials,
  };
}
