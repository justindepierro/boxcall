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
      className={`group relative flex flex-col items-center gap-3 transition-transform duration-200 active:scale-95 ${className}`}
      aria-label={title}
    >
      {/* App Icon - iPhone Style - Larger */}
      <div className="relative">
        {/* Icon Container with Gradient */}
        <div
          className={`relative w-24 h-24 rounded-[26px] bg-gradient-to-br ${gradient} shadow-lg overflow-hidden transition-all duration-200 group-hover:scale-110 group-active:scale-95`}
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          
          {/* Icon - Larger */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name={icon}
              className="w-12 h-12 text-white drop-shadow-lg"
            />
          </div>
        </div>

        {/* Badge (like notification count) */}
        {badge !== undefined && badge !== null && (
          <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
            <span className="text-white text-[11px] font-bold leading-none">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* App Name - Better wrapping */}
      <div className="text-center w-[100px]">
        <div 
          className="text-sm font-semibold text-slate-900 dark:text-white leading-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            minHeight: '2.5rem',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
});

AppIconTile.displayName = 'AppIconTile';
