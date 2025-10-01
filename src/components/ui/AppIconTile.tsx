import { memo } from 'react';
import { Icon, type IconName } from './Icon/Icon';

export interface AppIconTileProps {
  title: string;
  subtitle?: string;
  icon: IconName;
  onOpen: () => void;
  gradient: string;
  badge?: string | number;
  className?: string;
}

export const AppIconTile = memo<AppIconTileProps>(({
  title,
  subtitle,
  icon,
  onOpen,
  gradient,
  badge,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative flex flex-col items-center gap-2 transition-transform duration-200 active:scale-95 ${className}`}
      aria-label={title}
    >
      {/* App Icon - iPhone Style */}
      <div className="relative">
        {/* Icon Container with Gradient */}
        <div
          className={`relative w-20 h-20 rounded-[22px] bg-gradient-to-br ${gradient} shadow-lg overflow-hidden transition-all duration-200 group-hover:scale-110 group-active:scale-95`}
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name={icon}
              className="w-10 h-10 text-white drop-shadow-sm"
            />
          </div>
        </div>

        {/* Badge (like notification count) */}
        {badge && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] font-bold">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* App Name */}
      <div className="text-center max-w-[90px]">
        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate px-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate px-1">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
});

AppIconTile.displayName = 'AppIconTile';
