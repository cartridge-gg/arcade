import { formatAddress, type FormatAddressOptions } from "@cartridge/ui/utils";
import { toast } from "sonner";
import { useCallback } from "react";
import { getChecksumAddress } from "starknet";
import { CopyIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";

type AddressProps = {
  address: string;
  placeholder?: string;
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
  placeholder,
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
        "flex items-center gap-1 cursor-pointer text-foreground-300 hover:text-foreground-100 bg-background-150 hover:bg-background-200 py-1 px-1.5 rounded border border-solid border-background-200",
        className,
      )}
      onClick={onCopy}
    >
      <p className="text-sm font-mono font-normal px-0.5">
        {placeholder ?? formattedAddress}
      </p>
      <CopyIcon size="sm" />
    </div>
  );
}
