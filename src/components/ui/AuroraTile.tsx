import React, { type ReactNode } from "react";
import clsx from "clsx";

import { Typography } from "../design-system";
import { Icon, type IconName } from "./Icon/Icon";

export interface AuroraTileProps {
  title: string;
  description: string;
  icon: IconName;
  onOpen: () => void;
  accentOverlayClass: string;
  glowClassName: string;
  /**
   * Optional badge text rendered under the title. Ideal for category labels.
   */
  statusBadge?: string;
  /**
   * Footnote text rendered in the CTA footer. Defaults to "Tap to open".
   */
  footnote?: string;
  /**
   * Custom className applied to the outer button.
   */
  className?: string;
  /**
   * Override icon color classes.
   */
  iconClassName?: string;
  /**
   * Override icon capsule background classes.
   */
  iconContainerClassName?: string;
  /**
   * Optional content rendered in the body of the tile.
   */
  children?: ReactNode;
}

const BASE_BUTTON_CLASSES =
  "group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/80 text-left shadow-[0_20px_45px_-24px_rgba(15,23,42,0.56)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_60px_-30px_rgba(15,23,42,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jade-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-[0_20px_45px_-20px_rgba(0,0,0,0.75)] dark:focus-visible:ring-offset-slate-900";

const BASE_ICON_CONTAINER_CLASSES =
  "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-inner shadow-white/40 dark:bg-slate-800/80";

const BASE_ICON_CLASSES = "text-jade-600";

export const AuroraTile: React.FC<AuroraTileProps> = ({
  title,
  description,
  icon,
  onOpen,
  accentOverlayClass,
  glowClassName,
  statusBadge,
  footnote = "Tap to open",
  className,
  iconClassName,
  iconContainerClassName,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(BASE_BUTTON_CLASSES, "p-5 sm:p-6", className)}
      aria-label={`${title} — open workspace`}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute inset-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100",
          accentOverlayClass
        )}
      />
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100",
          glowClassName
        )}
      />
      <div className="relative z-10 flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={clsx(BASE_ICON_CONTAINER_CLASSES, iconContainerClassName)}>
              <Icon name={icon} size="lg" className={clsx(BASE_ICON_CLASSES, iconClassName)} />
            </span>
            <div className="flex flex-col">
              <Typography variant="headline-sm" className="font-semibold text-text-primary dark:text-slate-50">
                {title}
              </Typography>
              {statusBadge && (
                <Typography
                  variant="caption"
                  color="muted"
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary opacity-80"
                >
                  {statusBadge}
                </Typography>
              )}
            </div>
          </div>
        </div>
        <Typography
          variant="body-sm"
          color="muted"
          className="max-w-[220px] leading-snug text-text-secondary opacity-90 dark:text-slate-300"
        >
          {description}
        </Typography>
        {children && (
          <div className="flex-1">
            <div className="pointer-events-none select-none">
              {children}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary opacity-80 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <Icon name="grid" size="xs" className="text-jade-500" />
            Open workspace
          </span>
          <span>{footnote}</span>
        </div>
      </div>
    </button>
  );
};

AuroraTile.displayName = "AuroraTile";
