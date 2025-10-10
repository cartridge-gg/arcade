import { cn } from "@cartridge/ui/utils";
import type { ReactNode } from "react";

interface ConnectViewProps {
  className?: string;
  messageTitle: string;
  messageSubtitle: string;
  connection: ReactNode;
}

export const ConnectView = ({
  className,
  messageTitle,
  messageSubtitle,
  connection,
}: ConnectViewProps) => {
  return (
    <div className={cn("h-full", className)}>
      <div
        className="h-full flex flex-col gap-2 justify-center items-center select-none rounded"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23242824' stroke-width='2' stroke-dasharray='3%2c 6' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
        }}
      >
        <div className="flex flex-col justify-center items-center gap-8 h-full">
          <div className="flex flex-col justify-center items-center gap-3 w-[210px] lg:w-auto">
            <p className="text-foreground-200 text-lg/[22px] font-semibold text-center">
              {messageTitle}
            </p>
            <span className="text-background-500 text-sm text-center">
              {messageSubtitle}
            </span>
          </div>
          {connection}
        </div>
      </div>
    </div>
  );
};
