import { useMemo } from "react";
import Details from "./details";
import Media from "./media";
import Metrics from "./metrics";
import { EditionModel } from "@cartridge/arcade";
import GameSocials from "../modules/game-socials";

interface AboutProps {
  edition: EditionModel;
  socials?: {
    website?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
}

export function About({ edition, socials }: AboutProps) {
  const items = useMemo(() => {
    if (!edition) return [];
    const videos = edition.socials.videos?.filter((v) => !!v) ?? [];
    const images = edition.socials.images?.filter((i) => !!i) ?? [];
    return [...videos, ...images];
  }, [edition]);

  return (
    <div className="flex flex-col gap-4 py-3 lg:py-6">
      <Media key={edition?.id} items={items} />

      {socials && (
        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-wider font-semibold text-foreground-400">
            Links
          </p>
          <GameSocials socials={socials} />
        </div>
      )}
      <Details content={edition.description || ""} />
      <Metrics />
    </div>
  );
}
