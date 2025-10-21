import { useState } from "react";
import { Input, SearchIcon } from "@cartridge/ui";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search",
  disabled = false,
  className,
}: SearchInputProps) => {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative">
      <Input
        className={
          className ||
          "pr-9 bg-spacer-100 hover:bg-spacer-100 focus-visible:bg-spacer-100"
        }
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      <SearchIcon
        data-focused={focus}
        data-content={value.length > 0 && !focus}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-400 transition-colors duration-100 data-[content=true]:text-foreground-300 data-[focused=true]:text-foreground-100"
      />
    </div>
  );
};
