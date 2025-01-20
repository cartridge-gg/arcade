import { Games } from "../games";
import { User } from "../user";
import { Navigation } from "../navigation";
import { Inventory } from "../inventory";
import { SceneLayout } from "./layout";

export const InventoryScene = () => {
  return (
    <SceneLayout>
      <div className="w-full bg-background h-[calc(100vh-3.5rem)]">
        <div className="w-[1048px] flex flex-col items-stretch m-auto gap-y-8">
          <div className="flex justify-between items-center pt-8">
            <User />
            <Navigation />
          </div>
          <div className="flex justify-center gap-8">
            <Games />
            <Inventory />
          </div>
        </div>
      </div>
    </SceneLayout>
  );
};
