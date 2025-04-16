import {
  ArcadeMenuButton,
  cn,
  Select,
  SelectContent,
  useMediaQuery,
} from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";
import {
  GameSocialDiscord,
  GameSocialGithub,
  GameSocialTelegram,
  GameSocialTwitter,
  GameSocialWebsite,
} from "./game-social";

const gameSocialsVariants = cva("flex gap-2", {
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
    website: string;
    discord: string;
    telegram: string;
    twitter: string;
    github: string;
  };
}

const GameSocials = ({
  variant,
  className,
  socials,
  ...props
}: GameSocialsProps) => {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  return (
    <div className={cn(gameSocialsVariants({ variant }), className)} {...props}>
      <Select>
        <div className="grow flex justify-end items-center self-center">
          <ArcadeMenuButton
            active={false}
            className={cn(
              "bg-background-125 text-foreground-100 hover:bg-background-150 hover:text-foreground-100",
              !isMobile && "hidden",
            )}
          />
        </div>
        <SelectContent className="bg-background-100">
          {socials?.twitter && (
            <GameSocialTwitter twitter={socials.twitter} label />
          )}
          {socials?.discord && (
            <GameSocialDiscord discord={socials.discord} label />
          )}
          {socials?.telegram && (
            <GameSocialTelegram telegram={socials.telegram} label />
          )}
          {socials?.github && (
            <GameSocialGithub github={socials.github} label />
          )}
        </SelectContent>
        {socials?.twitter && !isMobile && (
          <GameSocialTwitter twitter={socials.twitter} />
        )}
        {socials?.discord && !isMobile && (
          <GameSocialDiscord discord={socials.discord} />
        )}
        {socials?.telegram && !isMobile && (
          <GameSocialTelegram telegram={socials.telegram} />
        )}
        {socials?.github && !isMobile && (
          <GameSocialGithub github={socials.github} />
        )}
        {socials?.website && <GameSocialWebsite website={socials.website} />}
      </Select>
    </div>
  );
};

export default GameSocials;
