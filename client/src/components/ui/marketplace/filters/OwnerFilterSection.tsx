import { memo, useCallback, useState, useRef, useEffect } from "react";
import { cn } from "@cartridge/ui";
import type { Account } from "@/effect/atoms";
import { UserAvatar } from "@/components/user/avatar";

interface OwnerFilterSectionProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  suggestions: Account[];
  isAddressInput: boolean;
  onSelectSuggestion: (account: Account) => void;
  onClear: () => void;
}

export const OwnerFilterSection = memo(
  ({
    inputValue,
    onInputChange,
    suggestions,
    isAddressInput,
    onSelectSuggestion,
    onClear,
  }: OwnerFilterSectionProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onInputChange(value);
        setShowDropdown(value.length > 0 && !isAddressInput);
      },
      [onInputChange, isAddressInput],
    );

    const handleSelectSuggestion = useCallback(
      (account: Account) => {
        onSelectSuggestion(account);
        setShowDropdown(false);
      },
      [onSelectSuggestion],
    );

    useEffect(() => {
      if (isAddressInput) {
        setShowDropdown(false);
      }
    }, [isAddressInput]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={containerRef}>
        <div className="relative">
          <input
            type="text"
            data-1p-ignore
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() =>
              setShowDropdown(
                inputValue.length > 0 &&
                  !isAddressInput &&
                  suggestions.length > 0,
              )
            }
            placeholder="Username or 0x..."
            className={cn(
              "w-full px-3 py-2 text-sm rounded",
              "bg-background-200 text-foreground-100",
              "placeholder:text-foreground-400",
              "focus:outline-none focus:ring-1 focus:ring-primary",
            )}
          />
          {inputValue && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-200 text-sm px-1"
            >
              ✕
            </button>
          )}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background-200 rounded shadow-lg max-h-48 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestions.map((account) => (
                <button
                  type="button"
                  key={account.address}
                  onClick={() => handleSelectSuggestion(account)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center gap-2",
                    "hover:bg-background-300 text-foreground-100",
                  )}
                >
                  <UserAvatar username={account.username} size="xs" />
                  {account.username}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

OwnerFilterSection.displayName = "OwnerFilterSection";
