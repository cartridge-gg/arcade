import { PredictionActivityFeed } from "../prediction/activity-feed";

const MOCKDATA = {
  username: "fortunaragem",
  total: 100,
  itemName: "shinobi",
  timestamp: "2 days ago",
};

export const PredictionActivityScene = () => {
  return (
    <div className="w-full h-full self-stretch flex flex-col gap-px rounded overflow-clip">
      {Array.from({ length: 5 }).map((_, index) => (
        <PredictionActivityFeed key={index} {...MOCKDATA} />
      ))}
    </div>
  );
};
