import type { ReactNode } from "react";
import { HeaderContainer } from "@/features/header";
import { SceneLayout } from "@/components/scenes/layout";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { ThemeProvider } from "@/context/theme";
import { useDevice } from "@/hooks/device";
import { TokenDetailSidebar } from "@/components/ui/marketplace/token-detail/TokenDetailSidebar";

interface TokenDetailTemplateProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function TokenDetailTemplate({ children }: TokenDetailTemplateProps) {
  const { isOpen, handleTouchMove, handleTouchStart } = useSidebar();
  const { isMobile } = useDevice();

  return (
    <ThemeProvider defaultScheme="dark">
      <SceneLayout>
        <div
          className={cn(
            "h-full w-full overflow-y-scroll lg:px-6 lg:py-5 lg:pt-0 ",
          )}
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className={cn(
              "w-full px-0 gap-3 lg:gap-6 2xl:gap-10 flex items-stretch m-auto h-full",
              "transition-all duration-300 ease-in-out justify-center",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-transparent",
                !isOpen && "hidden",
              )}
            />

            <div
              className={cn(
                "lg:space-y-4 h-full flex flex-col",
                "fixed lg:relative left-0 w-[min(calc(100vw-64px),360px)]",
                "transition-all duration-300 ease-in-out",
                !isOpen && isMobile ? "-translate-x-full" : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="flex-1 overflow-hidden">
                <TokenDetailSidebar />
              </div>
            </div>

            <div
              className={cn(
                "fixed lg:relative h-full w-full flex flex-col overflow-hidden px-0 lg:pb-0",
                "transition-all duration-300 ease-in-out max-w-[1320px]",
                "pb-[79px] lg:pb-0",
                isOpen
                  ? "translate-x-[min(calc(100vw-64px),360px)]"
                  : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="lg:hidden w-full p-3">
                <HeaderContainer />
              </div>

              <div
                className={cn(
                  "relative grow h-full flex flex-col rounded-none lg:rounded-xl lg:gap-3 overflow-hidden border border-background-200 bg-background-100 p-3 lg:p-6 order-2 lg:order-3",
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </SceneLayout>
    </ThemeProvider>
  );
}
