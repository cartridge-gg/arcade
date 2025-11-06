import { cn } from "@cartridge/ui/utils";

interface AssetPreviewProps {
  image?: string;
  name?: string;
  className?: string;
}

export function AssetPreview({ image, name, className }: AssetPreviewProps) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center bg-[#000000] rounded-xl border border-background-200 p-12",
        className,
      )}
    >
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
  );
}
