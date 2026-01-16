import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";

export function Tooltip({
  content,
  children,
}: { content: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side="top">
          <p>{content}</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
