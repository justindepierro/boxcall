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
        className={`relative p-2 sm:p-3 md:p-4 overflow-visible ${className}`}
      >
        <button
          type="button"
          onClick={onOpen}
          className="group relative flex flex-col items-center justify-center gap-1.5 transition-transform duration-base active:scale-press focus:outline-none focus:ring-2 focus:ring-interaction-focus focus:ring-offset-2 rounded-xl overflow-visible"
          aria-label={title}
        >
          {/* Top Label - Optional text above icon */}
          {topLabel && (
            <div className="text-xss font-semibold text-secondary dark:text-muted uppercase tracking-wide">
              {topLabel}
            </div>
          )}

          {/* App Icon - iPhone Style - Centered */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 overflow-visible transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.05]">
            {/* Icon Container with Gradient and shine effect */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} transition-all duration-300 group-hover:scale-[1.02] overflow-visible before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-tr before:from-white/30 before:via-white/20 before:to-transparent before:pointer-events-none shadow-lg shadow-jade-500/20 group-hover:shadow-2xl group-hover:shadow-jade-500/40`}
            />

            {/* Icon - Absolutely centered - Large size for better visibility */}
            <Icon
              name={icon}
              size={40}
              className="absolute inset-0 m-auto text-white drop-shadow-lg flex-shrink-0 z-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-2xl"
              aria-hidden="true"
            />

            {/* Badge (like notification count) - Positioned outside container */}
            {badge !== undefined && badge !== null && (
              <div className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-error-500 border-2 border-white dark:border-navy-900 flex items-center justify-center shadow-lg z-20">
                <span className="text-white text-xss font-bold leading-none">
                  {badge}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Label - Optional text below icon */}
          {bottomLabel && (
            <div className="text-xss font-medium text-secondary dark:text-neutral-400">
              {bottomLabel}
            </div>
          )}

          {/* App Name - Below everything */}
          <div className="text-center w-16 sm:w-20 md:w-22 mt-0.5">
            <div className="text-xs sm:text-sm font-semibold text-primary dark:text-white leading-tight line-clamp-2">
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
