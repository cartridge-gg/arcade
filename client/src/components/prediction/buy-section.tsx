import React, { HTMLAttributes } from "react";
import { BuyCard } from "./buy-card";
import { cn } from "@cartridge/ui";

const MOCKDATA = [
  {
    name: "bal7hazar",
    percentage: "21%",
    percentageChange: "-2.3%",
  },
  {
    name: "clicksave",
    percentage: "12%",
    percentageChange: "-1.1%",
  },
  {
    name: "flipper",
    percentage: "8%",
    percentageChange: "-0.5%",
  },
  {
    name: "gamer123",
    percentage: "5%",
    percentageChange: "-0.2%",
  },
  {
    name: "proplayer",
    percentage: "4%",
    percentageChange: "-0.1%",
  },
];

export const BuySection = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col w-full gap-px pb-4", className)}
    >
      {MOCKDATA.map((item, index) => (
        <BuyCard key={index} {...item} />
      ))}
    </div>
  );
});
