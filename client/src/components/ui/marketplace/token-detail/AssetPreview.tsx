import { TimesIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useState } from "react";
import { createPortal } from "react-dom";

interface AssetPreviewProps {
  image?: string;
  name?: string;
  className?: string;
}

export function AssetPreview({ image, name, className }: AssetPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsFullscreen(true)}
        className={cn(
          "w-full flex items-center justify-center bg-[#000000] rounded-xl py-8 cursor-pointer hover:shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] group",
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
