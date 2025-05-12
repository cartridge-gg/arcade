import { formatAddress, FormatAddressOptions } from "@cartridge/utils";
import { toast } from "sonner";
import { useCallback } from "react";
import { getChecksumAddress } from "starknet";
import { cn, CopyIcon } from "@cartridge/ui-next";

type AddressProps = {
  address: string;
  className?: string;
  copyable?: boolean;
  monospace?: boolean;
  explorerUrl?: string;
} & FormatAddressOptions;

/**
 * A component for consistently rendering Starknet addresses across the application
 */
export function CopyAddress({
  address,
  size,
  first,
  last,
  className,
}: AddressProps) {
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(getChecksumAddress(address));
    toast.success("Address copied");
  }, [address]);

  const formattedAddress = formatAddress(address, { first, last, size });

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer text-foreground-300 hover:text-foreground-200",
        className,
      )}
      onClick={onCopy}
    >
      <p className="text-sm font-mono font-normal px-0.5">{formattedAddress}</p>
      <CopyIcon size="sm" />
    </div>
  );
}
