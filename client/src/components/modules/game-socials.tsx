import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo } from "react";
import {
  GameSocialDiscord,
  GameSocialGithub,
  GameSocialTelegram,
  GameSocialTwitter,
} from "./game-social";

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
  // Create dynamic array of available social platforms
  const availableSocials = useMemo(() => {
    const platforms = [];

    if (socials?.twitter) {
      platforms.push({
        key: "twitter",
        component: (
          <GameSocialTwitter twitter={socials.twitter} label variant="dark" />
        ),
      });
    }
    if (socials?.discord) {
      platforms.push({
        key: "discord",
        component: (
          <GameSocialDiscord discord={socials.discord} label variant="dark" />
        ),
      });
    }
    if (socials?.telegram) {
      platforms.push({
        key: "telegram",
        component: (
          <GameSocialTelegram
            telegram={socials.telegram}
            label
            variant="dark"
          />
        ),
      });
    }
    if (socials?.github) {
      platforms.push({
        key: "github",
        component: (
          <GameSocialGithub github={socials.github} label variant="dark" />
        ),
      });
    }

    return platforms;
  }, [socials]);

  // Group socials into rows for table structure - MUST be called before early return
  const socialRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < availableSocials.length; i += 2) {
      rows.push(availableSocials.slice(i, i + 2));
    }
    return rows;
  }, [availableSocials]);

  // Return early if no socials available
  if (availableSocials.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Mobile: Single column stack */}
      <div className="block lg:hidden">
        <table className="w-full border-collapse">
          <tbody>
            {availableSocials.map((social, index) => (
              <tr key={`mobile-${index}`}>
                <td className="border border-background-200 p-0">
                  {social.component}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop: Two column table */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <tbody>
            {socialRows.map((row, rowIndex) => (
              <tr key={`desktop-row-${rowIndex}`}>
                {row.map((social, colIndex) => (
                  <td
                    key={`desktop-${rowIndex}-${colIndex}`}
                    className="border border-background-200 p-0 w-1/2"
                  >
                    {social.component}
                  </td>
                ))}
                {/* Fill empty cell if odd number of items - no border for empty cell */}
                {row.length === 1 && <td className="p-0 w-1/2"></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameSocials;
