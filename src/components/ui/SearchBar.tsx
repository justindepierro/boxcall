import React from "react";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  const isMobile = useIsMobile();

  const handleClear = () => {
    if (isMobile) {
      triggerHapticFeedback("light");
    }
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon - Larger on mobile */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${
          isMobile ? "pl-4" : "pl-3"
        }`}
      >
        <Icon
          name="search"
          className={`text-text-muted ${isMobile ? "h-5 w-5" : "h-4 w-4"}`}
        />
      </div>

      {/* Input - Larger on mobile (48px height) */}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${isMobile ? "h-12 pl-12 pr-12 text-base" : "pl-10 pr-10"}`}
      />

      {/* Clear Button - Larger touch target on mobile (48px) */}
      {value && (
        <button
          onClick={handleClear}
          className={`absolute inset-y-0 right-0 flex items-center text-text-muted hover:text-text-primary transition-colors active:scale-95 ${
            isMobile
              ? "pr-4 w-12 h-12 my-auto"
              : "pr-3 w-10 h-10 my-auto rounded-lg hover:bg-surface-secondary"
          }`}
          type="button"
          aria-label="Clear search"
        >
          <Icon name="close" className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      )}
    </div>
  );
};
