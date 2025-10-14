import type { EditionModel } from "@cartridge/arcade";
import { AboutView } from "@/components/ui/about/AboutView";
import { useAboutViewModel } from "./useAboutViewModel";

interface AboutContainerProps {
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

export const AboutContainer = ({ edition, socials }: AboutContainerProps) => {
  const viewModel = useAboutViewModel({ edition, socials });

  return (
    <AboutView
      mediaItems={viewModel.mediaItems}
      socials={viewModel.hasSocials ? viewModel.socials : undefined}
      details={viewModel.details}
      edition={edition}
    />
  );
};
