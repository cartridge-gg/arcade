import { ControllerIcon } from "@cartridge/ui-next";
import { Connection } from "./connection";

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
