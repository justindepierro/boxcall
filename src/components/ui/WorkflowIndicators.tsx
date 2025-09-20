import React from "react";
import { Icon, type IconName } from "../ui/Icon";
import { Badge } from "../ui/Badge";
import { Typography } from "../design-system/Typography";

export type WorkflowSection = {
  id: string;
  name: string;
  icon: IconName;
  status: "not-started" | "in-progress" | "completed";
  description: string;
};

export type WorkflowIndicatorsProps = {
  currentSection: string;
  sections: WorkflowSection[];
  className?: string;
};

export const WorkflowIndicators: React.FC<WorkflowIndicatorsProps> = ({
  currentSection,
  sections,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {sections.map((section, index) => {
        const isCurrent = section.id === currentSection;
        const isCompleted = section.status === "completed";
        const isInProgress = section.status === "in-progress";

        return (
          <React.Fragment key={section.id}>
            {/* Section Indicator */}
            <div className="flex flex-col items-center space-y-1">
              <div
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${
                    isCurrent
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : isCompleted
                        ? "border-green-600 bg-green-50"
                        : isInProgress
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-300 bg-slate-50"
                  }
                `}
              >
                <Icon
                  name={section.icon}
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isCurrent
                      ? "text-blue-600"
                      : isCompleted
                        ? "text-green-600"
                        : isInProgress
                          ? "text-orange-600"
                          : "text-slate-400"
                  }`}
                />{" "}
                {/* Status Badge */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="info" size="sm" className="text-xs px-1">
                      Now
                    </Badge>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Typography
                  variant="caption"
                  className={`font-medium transition-colors duration-300 ${
                    isCurrent
                      ? "text-blue-700"
                      : isCompleted
                        ? "text-green-700"
                        : isInProgress
                          ? "text-orange-700"
                          : "text-slate-500"
                  }`}
                >
                  {section.name}
                </Typography>
              </div>
            </div>

            {/* Connection Arrow (not for last item) */}
            {index < sections.length - 1 && (
              <div className="flex items-center">
                <div
                  className={`w-6 h-0.5 transition-colors duration-300 ${
                    sections[index + 1].status === "completed" ||
                    sections[index + 1].status === "in-progress"
                      ? "bg-blue-400"
                      : "bg-slate-300"
                  }`}
                />
                <Icon
                  name="arrow-right"
                  className={`h-3 w-3 ml-1 transition-colors duration-300 ${
                    sections[index + 1].status === "completed" ||
                    sections[index + 1].status === "in-progress"
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
