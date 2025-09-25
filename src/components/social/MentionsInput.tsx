// Mentions Component
// Provides @mention autocomplete functionality

import React, { useState, useRef } from "react";
import type { MentionSuggestion } from "../../services/mentionsService";
import { MentionsService } from "../../services/mentionsService";

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onMentionSelect?: (mention: MentionSuggestion) => void;
}

export const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder = "Type @ to mention someone...",
  className = "",
  onMentionSelect,
}) => {
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle input changes and mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(newCursorPos);

    // Check for @mention pattern
    const textBeforeCursor = newValue.substring(0, newCursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionStart(newCursorPos - query.length - 1); // -1 for @
      setShowSuggestions(true);

      // Get suggestions
      MentionsService.getMentionSuggestions(query).then((suggestions) => {
        setSuggestions(suggestions);
      });
    } else {
      setShowSuggestions(false);
      setMentionStart(-1);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: MentionSuggestion) => {
    if (mentionStart >= 0) {
      const beforeMention = value.substring(0, mentionStart);
      const afterMention = value.substring(cursorPosition);
      const newValue = `${beforeMention}@${suggestion.display_name} ${afterMention}`;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionStart(-1);

      // Move cursor after the mention
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos =
            mentionStart + suggestion.display_name.length + 2; // +2 for @ and space
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          inputRef.current.focus();
        }
      }, 0);

      onMentionSelect?.(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      // Could implement keyboard navigation here
    } else if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-3 border border-border-medium rounded-lg resize-none focus:ring-2 focus:ring-focus-info focus:border-border-info ${className}`}
        rows={3}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-surface-primary border border-border-medium rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-surface-secondary flex items-center space-x-2"
            >
              {suggestion.avatar_url ? (
                <img
                  src={suggestion.avatar_url}
                  alt={suggestion.display_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-border-light rounded-full flex items-center justify-center">
                  <span className="text-xs text-text-secondary">
                    {suggestion.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm">{suggestion.display_name}</span>
              <span className="text-xs text-text-muted ml-auto">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
