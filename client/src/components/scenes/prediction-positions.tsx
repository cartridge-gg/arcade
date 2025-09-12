import { PositionsLabel } from "../prediction/positions-label";
import { PredictionPositionCard } from "../prediction/positions-row";

const MOCKDATA = [
  {
    description: "to win Season 1 of Blitz Eternum",

    // User Info
    username: "bal7hazar",
    userAvatarClassName: "",

    // Balance Token/Asset Info
    balanceTokenIcon:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    balanceTokenAmount: 902,

    // To Earn Token/Asset Info
    earnTokenIcon:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    earnTokenAmount: 6300,
  },
  {
    description: "to win Season 1 of Blitz Eternum",

    // User Info
    username: "clicksave",
    userAvatarClassName: "",

    // Balance Token/Asset Info
    balanceTokenIcon:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    balanceTokenAmount: 902,

    // To Earn Token/Asset Info
    earnTokenIcon:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    earnTokenAmount: 6300,
  },
];

export const PredictionPositionsScene = () => {
  return (
    <div className="w-full h-full self-stretch flex flex-col gap-3 rounded overflow-clip">
      <PositionsLabel />

      {MOCKDATA.map((item, index) => (
        <PredictionPositionCard key={index} {...item} />
      ))}
    </div>
  );
};
