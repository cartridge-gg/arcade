import { cn } from "@cartridge/ui/utils";
import { Connection } from "../connection";

function Wrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("h-full", className)} {...props}>
      <div
        className="h-full flex flex-col gap-2 justify-center items-center select-none rounded"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23242824' stroke-width='2' stroke-dasharray='3%2c 6' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Connect({ className }: { className?: string }) {
  return (
    <Wrapper className={cn(className)}>
      <div className="flex flex-col justify-center items-center gap-8 h-full">
        <div className="flex flex-col justify-center items-center gap-3 w-[210px] lg:w-auto">
          <p className="text-foreground-200 text-lg/[22px] font-semibold text-center">
            Connect your Controller
          </p>
          <span className="text-background-500 text-sm text-center">
            Build and customize your own Dojo activity feed.
          </span>
        </div>
        <Connection />
      </div>
    </Wrapper>
  );
}
