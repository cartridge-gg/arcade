import { useMemo, useState } from "react";
import { ClockIcon, CollectibleTag, TagIcon, TimesIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { createPortal } from "react-dom";
import { formatExpirationDate } from "@/lib/shared/marketplace/utils";
import { Tooltip } from "@/components/ui/tooltip";
import type { OrderModel } from "@cartridge/arcade";

interface AssetPreviewProps {
  image?: string;
  name?: string;
  className?: string;
  order: OrderModel | null;
}

export function AssetPreview({
  image,
  name,
  className,
  order,
}: AssetPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { duration, dateTime } = useMemo(
    () => formatExpirationDate(order?.expiration, true),
    [order?.expiration],
  );

  return (
    <>
      <div
        onClick={() => setIsFullscreen(true)}
        className={cn(
          "relative w-full flex items-center justify-center bg-[#000000] rounded-xl py-8 cursor-pointer hover:shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] group",
          className,
        )}
      >
        <div className="w-[296px] h-[296px] group-hover:scale-[1.08] transition flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={name || "NFT"}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="w-64 h-64 bg-background-150 rounded-lg flex items-center justify-center">
              <p className="text-foreground-300 text-sm">No image available</p>
            </div>
          )}
        </div>

        {duration && (
          <div className="absolute bottom-[12px] left-[12px]">
            <Tooltip content={dateTime}>
              <CollectibleTag>
                <ClockIcon size="sm" variant="solid" className="mr-1" />
                {duration}
              </CollectibleTag>
            </Tooltip>
          </div>
        )}

        {!!order && (
          <div className="absolute top-[-2px] right-[12px]">
            <ListedTag>
              <TagIcon size="sm" variant="solid" className="text-[#0F1410]" />
            </ListedTag>
          </div>
        )}
      </div>

      {isFullscreen &&
        image &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-translucent-dark-300 backdrop-blur-[2px] flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              type="button"
              className="bg-translucent-light-100 hover:bg-translucent-light-150 flex items-center justify-center p-2 rounded absolute top-6 right-6"
            >
              <TimesIcon className="text-foreground" />
            </button>
            <img
              src={image}
              alt={name || "NFT"}
              className="w-[640px] h-[640px] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

const ListedTag = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="relative w-fit rounded overflow-hidden flex flex-col select-none">
      <div className="px-2.5 pt-[5px] pb-[3px] w-full bg-primary-100 flex items-center justify-center min-h-[28px]">
        {children}
      </div>
      <div className="flex justify-between w-full">
        <div
          className="h-0 w-0 border-t-[8px] border-t-primary-100 border-r-transparent"
          style={{ borderRightWidth: "20px" }}
        />
        <div
          className="h-0 w-0 border-t-[8px] border-t-primary-100 border-l-transparent"
          style={{ borderLeftWidth: "20px" }}
        />
      </div>
    </div>
  );
};
