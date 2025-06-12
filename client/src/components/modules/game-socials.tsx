import { DotsIcon, Select, SelectContent, useMediaQuery } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo } from "react";
import {
  GameSocialDiscord,
  GameSocialGithub,
  GameSocialTelegram,
  GameSocialTwitter,
  GameSocialWebsite,
} from "./game-social";
import ArcadeMenuButton from "./menu-button";

const gameSocialsVariants = cva("flex gap-3", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface GameSocialsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSocialsVariants> {
  socials?: {
    website?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
}

const GameSocials = ({
  variant,
  className,
  socials,
  ...props
}: GameSocialsProps) => {
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const isEmpty = useMemo(() => {
    if (!socials) return true;
    const { website, discord, telegram, twitter, github } = socials;
    return !website && !discord && !telegram && !twitter && !github;
  }, [socials]);

  return (
    <div
      className={cn(
        gameSocialsVariants({ variant }),
        isEmpty && "hidden",
        className,
      )}
      {...props}
    >
      <Select>
        <div className="grow flex justify-end items-center self-center">
          <ArcadeMenuButton
            active={false}
            className={cn(
              "bg-background-100 text-foreground-100 hover:bg-background-200 hover:text-foreground-100 w-9 h-9 rounded-full",
              !isMobile && "hidden",
            )}
          >
            <DotsIcon size="sm" />
          </ArcadeMenuButton>
        </div>
        <SelectContent className="bg-background-100">
          {socials?.twitter && (
            <GameSocialTwitter twitter={socials.twitter} label variant="dark" />
          )}
          {socials?.discord && (
            <GameSocialDiscord discord={socials.discord} label variant="dark" />
          )}
          {socials?.telegram && (
            <GameSocialTelegram
              telegram={socials.telegram}
              label
              variant="dark"
            />
          )}
          {socials?.github && (
            <GameSocialGithub github={socials.github} label variant="dark" />
          )}
        </SelectContent>
        {socials?.twitter && !isMobile && (
          <GameSocialTwitter twitter={socials.twitter} variant="dark" />
        )}
        {socials?.discord && !isMobile && (
          <GameSocialDiscord discord={socials.discord} variant="dark" />
        )}
        {socials?.telegram && !isMobile && (
          <GameSocialTelegram telegram={socials.telegram} variant="dark" />
        )}
        {socials?.github && !isMobile && (
          <GameSocialGithub github={socials.github} variant="dark" />
        )}
        {socials?.website && !isMobile && (
          <GameSocialWebsite website={socials.website} label />
        )}
      </Select>
    </div>
  );
};

export default GameSocials;
