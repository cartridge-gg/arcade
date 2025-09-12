import { Button, ClockIcon, cn, Thumbnail, TimesIcon } from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";
import React, { HTMLAttributes, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const PredictionHeader = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    let pathname = location.pathname;
    pathname = pathname.replace(/\/tab\/prediction-[^/]+$/, "");
    pathname = pathname.replace(/\/prediction$/, "");
    navigate(pathname || "/");
  }, [location, navigate]);

  return (
    <div
      id="prediction-header"
      className={cn("flex items-start justify-between self-stretch", className)}
      ref={ref}
      {...props}
    >
      <div className="flex items-center justify-between self-stretch pb-3">
        <div id="game-page-label" className="flex items-end gap-4">
          <Thumbnail
            variant="default"
            icon="https://static.cartridge.gg/presets/loot-survivor/icon.png"
            className="!w-16 !h-16 p-1"
          />
          <div id="label-group" className="flex flex-col items-start gap-2">
            <h1 className="text-foreground-100 text-xl/6 font-semibold">
              Blitz Edition Season 1
            </h1>
            <div className="flex items-start gap-2">
              <div className="bg-background-150 flex px-1.5 py-1 items-center gap-1 rounded">
                <div className="flex items-center gap-1">
                  <Thumbnail
                    size="xs"
                    variant="lighter"
                    rounded
                    icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
                  />
                  <h2 className="text-xs text-foreground-300 font-normal">
                    8,800 TVL
                  </h2>
                </div>
              </div>
              <div className="bg-background-150 flex px-1.5 py-1 items-center gap-1 rounded">
                <div className="flex items-center gap-0.5 text-foreground-300">
                  <div className="flex items-center justify-center px-0.5 gap-2.5">
                    <span className="text-sm font-normal">Created by</span>
                  </div>
                  <UserAvatar username="flipper" size="sm" />
                  <div className="flex items-center justify-center px-0.5 gap-2.5">
                    <span className="text-sm font-normal">flipper</span>
                  </div>
                </div>
              </div>
              <div className="bg-background-150 flex px-1.5 py-1 items-center gap-1 rounded">
                <div className="flex items-center gap-0.5 text-foreground-300 ">
                  <ClockIcon variant="solid" size="sm" />
                  <p className="text-xs font-normal">2d 12h 5m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CloseButton handleClose={handleClose} />
    </div>
  );
});

function CloseButton({ handleClose }: { handleClose: () => void }) {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleClose}
      className="bg-background-200 hover:bg-background-300 h-9 w-9 rounded-full"
    >
      <TimesIcon size="sm" />
    </Button>
  );
}
