import type { EditionModel } from "@cartridge/arcade";
import GameSocials from "@/components/ui/modules/game-socials";
import { AboutMedia } from "./AboutMedia";
import { AboutDetails } from "./AboutDetails";
import { AboutMetrics } from "./AboutMetrics";

interface AboutViewProps {
  edition: EditionModel;
  mediaItems: string[];
  details: string;
  socials?: {
    website?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
}

export const AboutView = ({ mediaItems, socials, details }: AboutViewProps) => {
  return (
    <div className="flex flex-col gap-4 py-3">
      <AboutMedia items={mediaItems} />

      {socials && (
        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-wider font-semibold text-foreground-400">
            Links
          </p>
          <GameSocials socials={socials} />
        </div>
      )}

      <AboutDetails content={details} />
      <AboutMetrics />
    </div>
  );
};
