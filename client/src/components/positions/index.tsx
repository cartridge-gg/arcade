import { ColumnLabels } from "./column-labels";
import { PositionCard, type PositionCardProps } from "./position-card";

export function Positions() {
  const positions = [
    {
      gameIcon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
      description: "to win Season 1 of Blitz Eternum",
      username: "bal7hazar",
      userAvatarClassName: "text-primary",
      timeRemaining: "2d 12h 5m",
      tokenIcon:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
      tokenAmount: "50",
      tokenValue: "$16.54",
      pnlAmount: "+1,600 (150%)",
      pnlClassName: "text-constructive-100",
    },
    {
      gameIcon: "https://static.cartridge.gg/presets/mage-duel/icon.png",
      description: "to defeat GrandMaster AI",
      username: "clicksave",
      userAvatarClassName: "text-blue-500",
      timeRemaining: "5d 3h 22m",
      tokenIcon: "https://static.cartridge.gg/tokens/usdc.svg",
      tokenAmount: "125",
      tokenValue: "$42.75",
      pnlAmount: "-250 (-20%)",
      pnlClassName: "text-destructive-100",
    },
    {
      gameIcon: "https://static.cartridge.gg/presets/mage-duel/icon.png",
      description: "to conquer the Northern Realm",
      username: "Djezus",
      userAvatarClassName: "text-amber-500",
      timeRemaining: "1d 8h 45m",
      tokenIcon: "https://static.cartridge.gg/tokens/usdc.svg",
      tokenAmount: "75",
      tokenValue: "$23.90",
      pnlAmount: "+500 (67%)",
      pnlClassName: "text-constructive-100",
    },
  ] satisfies Array<PositionCardProps>;

  return (
    <div className="flex flex-col gap-3 py-3 lg:py-6">
      <ColumnLabels />
      {positions.map((position, index) => (
        <PositionCard key={index} {...position} />
      ))}
    </div>
  );
}
