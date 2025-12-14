import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import {
  PRACTICE_BLOCK_TYPES,
  QUICK_TIME_INTERVALS,
} from "../../../types/practice";
import type { PracticeTemplate } from "../../../types/practice";

interface PracticeSidebarProps {
  templates: PracticeTemplate[];
  lockedSchedule: boolean;
  onQuickAddBlock: (
    type: keyof typeof PRACTICE_BLOCK_TYPES,
    duration: number
  ) => void;
  onCreateCustomBlock: () => void;
  onSelectTemplate: (templateId: string) => void;
  onViewAllTemplates: () => void;
}

export const PracticeSidebar: React.FC<PracticeSidebarProps> = ({
  templates,
  lockedSchedule,
  onQuickAddBlock,
  onCreateCustomBlock,
  onSelectTemplate,
  onViewAllTemplates,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        {/* Quick Time Intervals */}
        <Card>
          <div className="p-4">
            <Typography variant="headline-sm" className="text-primary mb-4">
              Quick Add Blocks
            </Typography>
            <div className="space-y-3">
              {Object.entries(PRACTICE_BLOCK_TYPES).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <Typography
                    variant="body-sm"
                    className="font-medium text-secondary"
                  >
                    {config.title}
                  </Typography>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(QUICK_TIME_INTERVALS).map((interval) => (
                      <Button
                        key={interval.duration}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onQuickAddBlock(
                            key as keyof typeof PRACTICE_BLOCK_TYPES,
                            interval.duration
                          )
                        }
                        disabled={lockedSchedule}
                        className="text-xs"
                      >
                        {interval.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Custom Block */}
        <Card>
          <div className="p-4">
            <Typography variant="headline-sm" className="text-primary mb-4">
              Custom Block
            </Typography>
            <Button
              onClick={onCreateCustomBlock}
              variant="primary"
              className="w-full"
              disabled={lockedSchedule}
            >
              + Create Custom Block
            </Button>
          </div>
        </Card>

        {/* Templates */}
        <Card>
          <div className="p-4">
            <Typography variant="headline-sm" className="text-primary mb-4">
              Practice Templates
            </Typography>
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <Button
                  key={template.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectTemplate(template.id)}
                  className="w-full justify-start text-left"
                >
                  {template.name}
                </Button>
              ))}
              <Button
                variant="brandLink"
                size="sm"
                onClick={onViewAllTemplates}
                className="w-full"
              >
                View All Templates →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

PracticeSidebar.displayName = "PracticeSidebar";
