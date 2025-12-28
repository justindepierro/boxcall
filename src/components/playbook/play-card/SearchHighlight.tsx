/**
 * SearchHighlight Component
 *
 * Highlights matching search terms within text.
 * Uses a bright background to make matches stand out.
 */

import React, { useMemo } from "react";

interface SearchHighlightProps {
  /** The text to search within */
  text: string;
  /** The search query to highlight */
  query?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights matching text with a yellow background
 */
export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  query,
  className = "",
}) => {
  // Memoize regex creation to avoid recreating on every render
  const { regex, trimmedQuery } = useMemo(() => {
    if (!query || query.trim().length === 0) {
      return { regex: null, trimmedQuery: "" };
    }
    const trimmed = query.trim();
    return {
      regex: new RegExp(`(${escapeRegex(trimmed)})`, "gi"),
      trimmedQuery: trimmed,
    };
  }, [query]);

  // If no query or empty query, return plain text
  if (!regex || !trimmedQuery) {
    return <span className={className}>{text}</span>;
  }

  // Split text by regex matches
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark
            key={index}
            className="bg-warning-200 text-warning-900 rounded px-0.5 font-semibold"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default SearchHighlight;
