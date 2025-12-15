import { useState } from "react";
import { Input, SearchIcon } from "@cartridge/ui";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search",
  disabled = false,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  autoFocus,
}: SearchInputProps) => {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative">
      <Input
        autoFocus={autoFocus}
        className={
          className ||
          "pl-9 bg-spacer-100 hover:bg-spacer-100 focus-visible:bg-spacer-100 w-0 lg:w-[320px] pr-1 lg:pr-4"
        }
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          setFocus(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
      />
      <SearchIcon
        data-focused={focus}
        data-content={value.length > 0 && !focus}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground-400 transition-colors duration-100 data-[content=true]:text-foreground-300 data-[focused=true]:text-foreground-100"
      />
    </div>
  );
};
