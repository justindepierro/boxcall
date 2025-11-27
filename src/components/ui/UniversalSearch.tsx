import React, { useState, useRef } from "react";
import { Icon } from "../ui/Icon";
import { Tooltip } from "./Tooltip/Tooltip";

export interface UniversalSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search plays, formations, tags...",
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClear = () => {
    onSearchChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  return (
    <div className={`relative ${className}`} role="search">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            name="search"
            className={`h-4 w-4 ${isFocused ? "text-info" : "text-secondary"}`}
            aria-hidden="true"
          />
        </div>

        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`block w-full pl-10 pr-10 py-2 text-sm rounded-lg
                     focus:ring-2 focus:ring-text-info focus:border-text-info
                     placeholder-text-secondary transition-all duration-200
                     ${isFocused ? "bg-surface-primary shadow-md" : "bg-surface-secondary hover:bg-surface-primary"}`}
        />

        {searchQuery && (
          <Tooltip content="Clear search">
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-secondary"
              type="button"
              aria-label="Clear search"
            >
              <Icon name="close" className="h-4 w-4" aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
