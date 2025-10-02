import { memo } from "react";
import { Icon, type IconName } from "./Icon/Icon";

export interface AppIconTileProps {
  title: string;
  subtitle?: string;
  topLabel?: string; // Text above icon
  bottomLabel?: string; // Text below icon (replaces subtitle if both provided)
  icon: IconName;
  onOpen: () => void;
  gradient: string;
  badge?: string | number;
  className?: string;
}

export const AppIconTile = memo<AppIconTileProps>(
  ({
    title,
    subtitle,
    topLabel,
    bottomLabel,
    icon,
    onOpen,
    gradient,
    badge,
    className = "",
  }) => {
    return (
      <div
        className={`relative overflow-visible ${className}`}
        style={{ padding: "8px" }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="group relative flex flex-col items-center justify-center gap-2 transition-transform duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2 rounded-2xl overflow-visible"
          aria-label={title}
        >
          {/* Top Label - Optional text above icon */}
          {topLabel && (
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {topLabel}
            </div>
          )}

          {/* App Icon - iPhone Style - Centered */}
          <div className="relative w-24 h-24 overflow-visible">
            {/* Icon Container with Gradient and shine effect */}
            <div
              className={`absolute inset-0 rounded-glass bg-gradient-to-br ${gradient} transition-all duration-200 group-hover:scale-105 group-active:scale-95 before:absolute before:inset-0 before:rounded-glass before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none overflow-visible`}
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* Icon - Absolutely centered - Dynamic sizing: 50% of container */}
            <Icon
              name={icon}
              className="absolute inset-0 m-auto w-1/2 h-1/2 text-white drop-shadow-lg flex-shrink-0 z-10"
              aria-hidden="true"
            />

            {/* Badge (like notification count) - Positioned outside container */}
            {badge !== undefined && badge !== null && (
              <div className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-2 rounded-full bg-red-500 border-[3px] border-white dark:border-slate-900 flex items-center justify-center shadow-lg z-20">
                <span className="text-white text-[11px] font-bold leading-none">
                  {badge}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Label - Optional text below icon */}
          {bottomLabel && (
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {bottomLabel}
            </div>
          )}

          {/* App Name - Below everything */}
          <div className="text-center w-[100px] mt-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
              {title}
            </div>
            {subtitle && !bottomLabel && (
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </button>
      </div>
    );
  }
);

AppIconTile.displayName = "AppIconTile";
