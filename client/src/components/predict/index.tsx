import PredictCard, { PredictCardProps } from "./predict-card";

const demoPredict = {
  image: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
  title: "Loot Survivor",
  subtitle: "Season 4 winner",
  user1Name: "aloothero",
  user1Score: 8,
  user2Name: "else",
  user2Score: 92,
  price: "8,800 TVL",
  time: "2 Days",
} satisfies PredictCardProps;

export const Predict = () => {
  return (
    <div className="py-3 lg:py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from(
        [1, 2, 3, 4].map((i) => <PredictCard key={i} {...demoPredict} />),
      )}
    </div>
  );
};
