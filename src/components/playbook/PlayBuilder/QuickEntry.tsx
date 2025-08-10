/**
 * Quick Entry Mode for PlayBuilder
 * Allows rapid play creation with format: "Power O | I-Form | Run | 21 Personnel"
 */

import React, { useState } from "react";
import { Button } from "../../ui/Button/Button";
import type { Play } from "../../../types/play";
import {
  normalizePlayName,
  normalizeFormation,
  normalizeText,
} from "../../../utils/textNormalization";

interface QuickEntryProps {
  onPlayParsed: (playData: Partial<Play>) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const QuickEntry: React.FC<QuickEntryProps> = ({
  onPlayParsed,
  isVisible,
  onToggle,
}) => {
  const [quickInput, setQuickInput] = useState("");

  const parseQuickEntry = (input: string): Partial<Play> => {
    if (!input.trim()) return {};

    // Split by pipe (|) or comma for flexibility
    const parts = input.split(/[|,]/).map((part) => part.trim());

    const playData: Partial<Play> = {};

    // Parse each part based on common patterns
    parts.forEach((rawPart, index) => {
      // Preserve original for display but use normalized for logic
      const part = rawPart.trim();
      const lowerPart = part.toLowerCase();

      // Index-based parsing (most reliable)
      switch (index) {
        case 0: // Play name
          playData.play_name = normalizePlayName(part);
          break;
        case 1: // Formation
          playData.formation = normalizeFormation(part);
          break;
        case 2: // Play type
          if (lowerPart.includes("run") || lowerPart === "r") {
            playData.p_type = "Run";
          } else if (lowerPart.includes("pass") || lowerPart === "p") {
            playData.p_type = "Pass";
          } else if (lowerPart.includes("rpo")) {
            playData.p_type = "RPO";
          } else if (
            lowerPart.includes("play action") ||
            lowerPart.includes("pa")
          ) {
            playData.p_type = "Play Action";
          } else {
            playData.p_type = part;
          }
          break;
        case 3: // Personnel or other
          if (/^\d{2}/.test(part)) {
            playData.personnel = part.substring(0, 2);
          }
          break;
      }

      // Pattern-based parsing for flexibility
      if (/^\d{2}(\s|$)/.test(part)) {
        // Personnel package (11, 12, 21, etc.)
        playData.personnel = part.substring(0, 2);
      } else if (
        lowerPart.includes("shotgun") ||
        lowerPart.includes("gun") ||
        lowerPart.includes("i-form") ||
        lowerPart.includes("singleback")
      ) {
        // Formation indicators
        if (!playData.formation) {
          playData.formation = normalizeFormation(part);
        }
      } else if (
        lowerPart === "run" ||
        lowerPart === "pass" ||
        lowerPart === "rpo" ||
        lowerPart.includes("play action")
      ) {
        // Play type indicators
        if (!playData.p_type) {
          if (lowerPart === "run") playData.p_type = "Run";
          else if (lowerPart === "pass") playData.p_type = "Pass";
          else if (lowerPart === "rpo") playData.p_type = "RPO";
          else if (lowerPart.includes("play action"))
            playData.p_type = "Play Action";
        }
      }
    });

    // Final normalization pass (defensive)
    if (playData.play_name) {
      playData.play_name = normalizePlayName(playData.play_name);
    }
    if (playData.formation) {
      playData.formation = normalizeFormation(playData.formation);
    }
    if (playData.one_word_play) {
      playData.one_word_play = normalizeText(playData.one_word_play);
    }

    return playData;
  };

  const handleQuickSubmit = () => {
    if (!quickInput.trim()) return;

    const parsedData = parseQuickEntry(quickInput);

    // Add some smart defaults
    const enhancedData: Partial<Play> = {
      ...parsedData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    onPlayParsed(enhancedData);
    setQuickInput("");
    onToggle(); // Hide quick entry after successful parse
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleQuickSubmit();
    }
  };

  if (!isVisible) {
    return (
      <div className="mb-4">
        <Button
          onClick={onToggle}
          variant="link"
          size="sm"
          className="flex items-center space-x-2 font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Quick Entry Mode</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-jade-50 border border-jade-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-jade-900 flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>⚡ Quick Entry Mode</span>
        </h3>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="xs"
          className="text-jade-600 hover:text-jade-700 p-1 h-auto w-auto"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-jade-700 mb-2">
            Enter play details separated by | or comma:
          </label>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Power O | I-Form | Run | 21 Personnel"
            className="playbuilder-input w-full px-4 py-3 bg-white border-2 border-jade-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-base"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-jade-600">
            <div className="font-medium mb-1">Examples:</div>
            <div className="space-y-1 text-xs">
              <div>
                •{" "}
                <code className="bg-jade-100 px-1 rounded">
                  Four Verticals | Shotgun | Pass | 11
                </code>
              </div>
              <div>
                •{" "}
                <code className="bg-jade-100 px-1 rounded">
                  Power O, I-Form, Run, 21 Personnel
                </code>
              </div>
              <div>
                •{" "}
                <code className="bg-jade-100 px-1 rounded">
                  Quick Slant | Gun | Pass
                </code>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => setQuickInput("")}
              variant="outline"
              size="xs"
            >
              Clear
            </Button>
            <Button
              onClick={handleQuickSubmit}
              disabled={!quickInput.trim()}
              variant="primary"
              size="sm"
              className="font-medium"
            >
              Parse & Fill ⚡
            </Button>
          </div>
        </div>

        <div className="text-xs text-jade-600 bg-jade-100 p-2 rounded-md">
          <strong>Pro Tip:</strong> Use Cmd+Enter (Mac) or Ctrl+Enter to quickly
          parse entries
        </div>
      </div>
    </div>
  );
};
