import { TabsContent } from "@cartridge/ui";
import { ArcadeTabs, TabValue } from "../modules";
import { PredictionActivityScene } from "../scenes/prediction-activity";
import { PredictionHoldersScene } from "../scenes/prediction-holders";
import { PredictionCommentsScene } from "../scenes/prediction-comments";
import { PredictionPositionsScene } from "../scenes/prediction-positions";

export interface PredictionTabsProps {
  defaultValue?: TabValue;
  onTabClick?: (tab: TabValue) => void;
}

export function PredictionTabs({
  defaultValue = "prediction-activity",
  onTabClick,
}: PredictionTabsProps) {
  const order: TabValue[] = [
    "prediction-activity",
    "prediction-holders",
    "prediction-comments",
    "prediction-positions",
  ];

  return (
    <div className="w-full">
      <ArcadeTabs
        order={order}
        defaultValue={defaultValue as TabValue}
        onTabClick={onTabClick}
        className="h-auto"
      >
        <div className="flex justify-center gap-8 w-full px-6">
          <TabsContent
            className="p-0 py-3 lg:py-6 mt-0 w-full"
            value="prediction-activity"
          >
            <PredictionActivityScene />
          </TabsContent>
          <TabsContent
            className="p-0 py-3 lg:py-6 mt-0 w-full"
            value="prediction-holders"
          >
            <PredictionHoldersScene />
          </TabsContent>
          <TabsContent
            className="p-0 py-3 lg:py-6 mt-0 w-full"
            value="prediction-comments"
          >
            <PredictionCommentsScene />
          </TabsContent>
          <TabsContent
            className="p-0 py-3 lg:py-6 mt-0 w-full"
            value="prediction-positions"
          >
            <PredictionPositionsScene />
          </TabsContent>
        </div>
      </ArcadeTabs>
    </div>
  );
}
