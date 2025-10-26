import React from "react";

interface RoutePerformanceBarProps {
  successRate: number;
  totalExecutions: number;
  label: string;
  className?: string;
}

export const RoutePerformanceBar: React.FC<RoutePerformanceBarProps> = ({
  successRate,
  totalExecutions,
  label,
  className = "",
}) => {
  const percentage = Math.round(successRate * 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium truncate mr-2">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-neutral-600">{percentage}%</span>
          <span className="text-neutral-400">({totalExecutions})</span>
        </div>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-jade-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface RoutePerformanceChartProps {
  routes: Array<{
    routeId: string;
    routeLabel?: string;
    successRate: number;
    totalExecutions: number;
  }>;
  maxRoutes?: number;
  className?: string;
}

export const RoutePerformanceChart: React.FC<RoutePerformanceChartProps> = ({
  routes,
  maxRoutes = 10,
  className = "",
}) => {
  const displayRoutes = routes.slice(0, maxRoutes);

  return (
    <div className={`space-y-4 ${className}`}>
      {displayRoutes.map((route) => (
        <RoutePerformanceBar
          key={route.routeId}
          successRate={route.successRate}
          totalExecutions={route.totalExecutions}
          label={route.routeLabel || `Route ${route.routeId.slice(-4)}`}
        />
      ))}
    </div>
  );
};
