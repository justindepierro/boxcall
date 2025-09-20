import React from "react";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import { useDataFlowTracking } from "../../hooks/useDataFlowTracking";

export type DataFlowSummaryProps = {
  className?: string;
};

export const DataFlowSummary: React.FC<DataFlowSummaryProps> = ({
  className = "",
}) => {
  const { metrics } = useDataFlowTracking();

  const flowItems = [
    {
      label: "In Practice Plans",
      value: metrics.playsInPractice,
      icon: "clipboard-list" as const,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "In Game Plans",
      value: metrics.playsInGamePlans,
      icon: "target" as const,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Avg Maturity",
      value: `${metrics.averageMaturity}%`,
      icon: "trending-up" as const,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {flowItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${item.bgColor}`}
          >
            <Icon name={item.icon} className={`h-4 w-4 ${item.color}`} />
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              className={`font-semibold ${item.color}`}
            >
              {item.value}
            </Typography>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              {item.label}
            </div>
          </div>
        </div>
      ))}

      {/* Recent Activity Indicator */}
      {metrics.recentActivity.length > 0 && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50">
            <Icon name="activity" className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-center">
            <Typography
              variant="headline-sm"
              className="font-semibold text-orange-600"
            >
              {metrics.recentActivity.length}
            </Typography>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Recent
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
