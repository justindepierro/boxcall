/**
 * Quick Entry Mode for PlayBuilder
 * Allows rapid play creation with format: "Power O | I-Form | Run | 21 Personnel"
 */

import React, { useState } from "react";
import type { Play } from "../../../types/play";

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
    parts.forEach((part, index) => {
      const lowerPart = part.toLowerCase();

      // Index-based parsing (most reliable)
      switch (index) {
        case 0: // Play name
          playData.play_name = part;
          break;
        case 1: // Formation
          playData.formation = part;
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
          playData.formation = part;
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
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
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
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-emerald-900 flex items-center space-x-2">
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
        <button
          onClick={onToggle}
          className="text-emerald-600 hover:text-emerald-700"
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
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-2">
            Enter play details separated by | or comma:
          </label>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Power O | I-Form | Run | 21 Personnel"
            className="playbuilder-input w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-emerald-600">
            <div className="font-medium mb-1">Examples:</div>
            <div className="space-y-1 text-xs">
              <div>
                •{" "}
                <code className="bg-emerald-100 px-1 rounded">
                  Four Verticals | Shotgun | Pass | 11
                </code>
              </div>
              <div>
                •{" "}
                <code className="bg-emerald-100 px-1 rounded">
                  Power O, I-Form, Run, 21 Personnel
                </code>
              </div>
              <div>
                •{" "}
                <code className="bg-emerald-100 px-1 rounded">
                  Quick Slant | Gun | Pass
                </code>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setQuickInput("")}
              className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50"
            >
              Clear
            </button>
            <button
              onClick={handleQuickSubmit}
              disabled={!quickInput.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Parse & Fill ⚡
            </button>
          </div>
        </div>

        <div className="text-xs text-emerald-600 bg-emerald-100 p-2 rounded-md">
          <strong>Pro Tip:</strong> Use Cmd+Enter (Mac) or Ctrl+Enter to quickly
          parse entries
        </div>
      </div>
    </div>
  );
};
