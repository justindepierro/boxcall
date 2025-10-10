/**
 * TipsPopover - Collapsible keyboard shortcuts and tips
 *
 * Space-saving popover with lightbulb icon that reveals
 * keyboard shortcuts and editor tips for the diagram editor.
 */

import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Icon } from "../../../../components/ui/Icon/Icon";
import type { Tip } from "../constants/editorTips";

export interface TipsPopoverProps {
  tips: Tip[];
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const TipsPopover: React.FC<TipsPopoverProps> = ({
  tips,
  side = "bottom",
  align = "center",
}) => {
  // Group tips by category
  const groupedTips = tips.reduce(
    (acc, tip) => {
      if (!acc[tip.category]) {
        acc[tip.category] = [];
      }
      acc[tip.category].push(tip);
      return acc;
    },
    {} as Record<string, Tip[]>
  );

  const categories = Object.keys(groupedTips).sort();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-jade-500 p-2 text-white shadow-sm transition-colors hover:bg-jade-600 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2"
          aria-label="Show keyboard shortcuts and tips"
        >
          <Icon name="lightbulb" className="h-5 w-5" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          className="z-50 w-80 rounded-lg border border-border bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-content-primary">
              Quick Tips
            </h3>
            <Popover.Close
              className="rounded-md p-1 text-content-tertiary hover:bg-surface-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:ring-jade-500"
              aria-label="Close"
            >
              <Icon name="close" className="h-4 w-4" />
            </Popover.Close>
          </div>

          <div className="max-h-96 space-y-4 overflow-y-auto">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-medium text-content-primary">
                  {category}
                </h4>
                <div className="space-y-1.5">
                  {groupedTips[category].map((tip, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      {tip.key && (
                        <kbd className="inline-flex min-w-18 shrink-0 items-center justify-center rounded border border-border bg-surface-secondary px-2 py-0.5 font-mono text-xs font-semibold text-content-primary">
                          {tip.key}
                        </kbd>
                      )}
                      <span
                        className={`text-content-secondary ${!tip.key ? "pl-0" : ""}`}
                      >
                        {tip.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
