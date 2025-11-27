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
  "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-secondary text-left shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary min-h-40 md:min-h-44";

const BASE_ICON_CONTAINER_CLASSES =
  "inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-surface-subtle text-brand-primary shadow-sm transition-all duration-300 group-hover:shadow-md";

const BASE_ICON_CLASSES = "text-brand-primary";

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
      className={clsx(BASE_BUTTON_CLASSES, "p-5 md:p-6", className)}
      aria-label={`${title} — open workspace`}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-25",
          accentOverlayClass
        )}
      />
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40",
          glowClassName
        )}
      />
      <div className="relative z-10 flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                BASE_ICON_CONTAINER_CLASSES,
                iconContainerClassName
              )}
            >
              <Icon
                name={icon}
                size="lg"
                className={clsx(BASE_ICON_CLASSES, iconClassName)}
              />
            </span>
            <div className="flex flex-col">
              <Typography
                variant="headline-sm"
                className="font-semibold text-primary dark:text-slate-50 text-base md:text-lg"
              >
                {title}
              </Typography>
              {statusBadge && (
                <Typography
                  variant="label-md"
                  color="muted"
                  className="opacity-80"
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
          className="max-w-56 leading-snug text-secondary opacity-90 dark:text-slate-300"
        >
          {description}
        </Typography>
        {children && (
          <div className="flex-1">
            <div className="pointer-events-none select-none">{children}</div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Typography
            as="span"
            variant="body-xs"
            className="inline-flex items-center gap-2 text-secondary opacity-80"
          >
            <Icon name="grid" size="xs" className="text-brand-primary" />
            Open workspace
          </Typography>
          <Typography as="span" variant="body-xs" color="muted">
            {footnote}
          </Typography>
        </div>
      </div>
    </button>
  );
};

AuroraTile.displayName = "AuroraTile";
