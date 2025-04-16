import { Collections } from "./collections";
import { Tokens } from "./tokens";

export const Inventory = () => {
  return (
    <div className="w-full flex flex-col gap-4 py-3 lg:py-6 rounded">
      <Tokens />
      <Collections />
    </div>
  );
};
