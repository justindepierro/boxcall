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
          className="group relative flex flex-col items-center justify-center gap-2 transition-transform duration-base active:scale-press focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2 rounded-xl overflow-visible"
          aria-label={title}
        >
          {/* Top Label - Optional text above icon */}
          {topLabel && (
            <div className="text-xss font-semibold text-secondary dark:text-muted uppercase tracking-wide">
              {topLabel}
            </div>
          )}

          {/* App Icon - iPhone Style - Centered */}
          <div className="relative w-24 h-24 overflow-visible">
            {/* Icon Container with Gradient and shine effect */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} transition-all duration-base group-hover:scale-base group-active:scale-press before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-tr before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none overflow-visible`}
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
              <div className="absolute -top-2 -right-2 min-w-6 h-6 px-2 rounded-full bg-red-500 border-[3px] border-white dark:border-slate-900 flex items-center justify-center shadow-lg z-20">
                <span className="text-white text-xs font-bold leading-none">
                  {badge}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Label - Optional text below icon */}
          {bottomLabel && (
            <div className="text-xss font-medium text-secondary dark:text-slate-400">
              {bottomLabel}
            </div>
          )}

          {/* App Name - Below everything */}
          <div className="text-center w-24 mt-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
              {title}
            </div>
            {subtitle && !bottomLabel && (
              <div className="text-xss text-secondary dark:text-muted truncate mt-0.5">
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
