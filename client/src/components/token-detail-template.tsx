import type { ReactNode } from "react";
import { TokenDetailSidebar } from "@/components/ui/marketplace/token-detail/TokenDetailSidebar";
import { BaseTemplate } from "./base-template";

interface TokenDetailTemplateProps {
  children: ReactNode;
}

export function TokenDetailTemplate({ children }: TokenDetailTemplateProps) {
  return (
    <BaseTemplate
      outerClassName="overflow-y-scroll"
      contentClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll"
      sidebarContent={
        <div className="flex-1 overflow-hidden">
          <TokenDetailSidebar />
        </div>
      }
    >
      {children}
    </BaseTemplate>
  );
}
