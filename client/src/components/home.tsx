import { ControllerIcon } from "@cartridge/ui-next";
import { Connection } from "./connection";
import { Games } from "./games";
import { User } from "./user";
import { Navigation } from "./navigation";
import { Inventory } from "./inventory";

export const Header = () => {
  return (
    <div className="h-14 flex justify-between gap-x-px w-full">
      <div className="bg-background w-14 flex items-center justify-center">
        <ControllerIcon className="h-6 w-6 text-primary" size={"lg"} />
      </div>
      <div className="bg-background flex justify-end items-center grow px-3 py-2">
        <Connection />
      </div>
    </div>
  );
};

export const Scene = () => {
  return (
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
  );
};

export const Home = () => {
  return (
    <div className="bg-spacer flex flex-col items-center gap-y-px select-none h-screen overflow-clip">
      <Header />
      <Scene />
    </div>
  );
};
