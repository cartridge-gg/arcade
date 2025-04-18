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
              "bg-background-100 text-foreground-100 hover:bg-background-200 hover:text-foreground-100 w-9 h-9 rounded-full",
              !isMobile && "hidden",
            )}
          />
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
        {socials?.website && (
          <GameSocialWebsite website={socials.website} label={!isMobile} />
        )}
      </Select>
    </div>
  );
};

export default GameSocials;
