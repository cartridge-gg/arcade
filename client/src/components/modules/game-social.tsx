import {
  cn,
  DiscordIcon,
  GitHubIcon,
  PlayIcon,
  TelegramIcon,
  XIcon,
} from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

interface GameSocialWebsiteProps
  extends VariantProps<typeof GameSocialVariants> {
  website: string;
}
export const GameSocialWebsite = ({
  website,
  variant,
}: GameSocialWebsiteProps) => {
  return (
    <GameSocial
      icon={<PlayIcon size="xs" />}
      href={website}
      label="Play"
      variant={variant}
      className="text-primary"
    />
  );
};

interface GameSocialDiscordProps
  extends VariantProps<typeof GameSocialVariants> {
  discord: string;
  label?: boolean;
}
export const GameSocialDiscord = ({
  discord,
  label,
  variant,
}: GameSocialDiscordProps) => {
  return (
    <GameSocial
      icon={<DiscordIcon size="xs" />}
      href={discord}
      variant={variant}
      label={label ? "Discord" : undefined}
    />
  );
};

interface GameSocialTwitterProps
  extends VariantProps<typeof GameSocialVariants> {
  twitter: string;
  label?: boolean;
}
export const GameSocialTwitter = ({
  twitter,
  variant,
  label,
}: GameSocialTwitterProps) => {
  const xhandle = twitter.split("/").pop();
  return (
    <GameSocial
      icon={<XIcon size="xs" />}
      href={twitter}
      variant={variant}
      label={label ? `@${xhandle}` : undefined}
    />
  );
};

interface GameSocialGithubProps
  extends VariantProps<typeof GameSocialVariants> {
  github: string;
  label?: boolean;
}
export const GameSocialGithub = ({
  github,
  variant,
  label,
}: GameSocialGithubProps) => {
  return (
    <GameSocial
      icon={<GitHubIcon size="xs" />}
      href={github}
      variant={variant}
      label={label ? "GitHub" : undefined}
    />
  );
};

interface GameSocialTelegramProps
  extends VariantProps<typeof GameSocialVariants> {
  telegram: string;
  label?: boolean;
}
export const GameSocialTelegram = ({
  telegram,
  variant,
  label,
}: GameSocialTelegramProps) => {
  return (
    <GameSocial
      icon={<TelegramIcon size="xs" />}
      href={telegram}
      variant={variant}
      label={label ? "Telegram" : undefined}
    />
  );
};

const GameSocialVariants = cva(
  "flex items-center gap-x-1 rounded px-3 py-2 cursor-pointer text-foreground-100",
  {
    variants: {
      variant: {
        default: "bg-background-125 hover:bg-background-150",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface GameSocialProps
  extends HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof GameSocialVariants> {
  icon: React.ReactNode;
  href: string;
  label?: string;
}

const GameSocial = ({
  icon,
  href,
  label,
  variant,
  className,
}: GameSocialProps) => {
  return (
    <a
      href={href}
      draggable={false}
      target="_blank"
      className={cn(GameSocialVariants({ variant }), className)}
    >
      {icon}
      {label && (
        <p className="px-0.5 text-xs font-medium truncate max-w-32">{label}</p>
      )}
    </a>
  );
};

export default GameSocial;
