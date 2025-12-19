import {
  forwardRef,
  useEffect,
  useRef,
  type ForwardedRef,
  type RefObject,
} from "react";

import { Typography } from "../../design-system";

/**
 * BoxCall TextArea Component
 *
 * Professional textarea component with auto-resize and character counting
 */
import type { TextAreaProps } from "./TextArea.types";

function getStatusMessage({
  status,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
}: Pick<
  TextAreaProps,
  "status" | "helperText" | "errorMessage" | "successMessage" | "warningMessage"
>) {
  if (status === "error" && errorMessage) return errorMessage;
  if (status === "success" && successMessage) return successMessage;
  if (status === "warning" && warningMessage) return warningMessage;
  return helperText;
}

function getStatusMessageColor(status: TextAreaProps["status"]) {
  switch (status) {
    case "error":
      return "error";
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return "muted";
  }
}

function buildTextAreaClasses({
  size,
  status,
  autoResize,
  fullWidth,
  className,
}: {
  size: NonNullable<TextAreaProps["size"]>;
  status: NonNullable<TextAreaProps["status"]>;
  autoResize: boolean;
  fullWidth: boolean;
  className: string;
}) {
  const classes: string[] = [
    "block w-full rounded-lg border-card transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    textareaStyles.base,
    textareaStyles.statuses[status],
  ];

  if (size === "sm") classes.push("px-3 py-1.5 text-sm");
  if (size === "md") classes.push("px-3 py-2 text-sm");
  if (size === "lg") classes.push("px-4 py-3 text-base");

  classes.push(autoResize ? "resize-none" : "resize-y");
  if (fullWidth) classes.push("w-full");
  if (className) classes.push(className);

  return classes.filter(Boolean).join(" ");
}

function buildContainerClasses({
  fullWidth,
  containerClassName,
}: {
  fullWidth: boolean;
  containerClassName: string;
}) {
  const classes: string[] = ["space-y-1"];
  if (fullWidth) classes.push("w-full");
  if (containerClassName) classes.push(containerClassName);
  return classes.filter(Boolean).join(" ");
}

function buildLabelClasses({
  size,
  labelClassName,
}: {
  size: NonNullable<TextAreaProps["size"]>;
  labelClassName: string;
}) {
  const classes: string[] = [
    "block",
    size === "sm" ? "text-xs" : "text-sm",
    "font-medium text-primary text-border-light",
  ];
  if (labelClassName) classes.push(labelClassName);
  return classes.filter(Boolean).join(" ");
}

function buildAriaDescribedBy({
  textareaId,
  statusMessage,
  showCharacterCount,
}: {
  textareaId: string;
  statusMessage: string | undefined;
  showCharacterCount: boolean;
}) {
  const ids: string[] = [];
  if (statusMessage) ids.push(`${textareaId}-helper`);
  if (showCharacterCount) ids.push(`${textareaId}-count`);
  return ids.length ? ids.join(" ") : undefined;
}

function setTextareaAutoHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function resolveTextareaId(id?: string) {
  if (id) return id;
  return `textarea-${Math.random().toString(36).substr(2, 9)}`;
}

function resolveInternalRef(
  forwardedRef: ForwardedRef<HTMLTextAreaElement>,
  localRef: RefObject<HTMLTextAreaElement | null>
) {
  if (forwardedRef) return forwardedRef;
  return localRef;
}

function getCharacterCount(value: TextAreaProps["value"]) {
  if (!value) return 0;
  return String(value).length;
}

function getIsOverLimit({
  characterCount,
  maxLength,
}: {
  characterCount: number;
  maxLength: number | undefined;
}) {
  if (!maxLength) return false;
  return characterCount > maxLength;
}

function renderTextAreaLabel({
  label,
  textareaId,
  labelClasses,
  required,
}: {
  label: TextAreaProps["label"];
  textareaId: string;
  labelClasses: string;
  required: boolean;
}) {
  if (!label) return null;
  return (
    <label htmlFor={textareaId} className={labelClasses}>
      <Typography variant="label-md" color="error">
        {label}
        {required ? <span className="text-error ml-1">*</span> : null}
      </Typography>
    </label>
  );
}

function renderTextAreaHelper({
  textareaId,
  statusMessage,
  statusMessageColor,
}: {
  textareaId: string;
  statusMessage: string | undefined;
  statusMessageColor: ReturnType<typeof getStatusMessageColor>;
}) {
  if (!statusMessage) return null;
  return (
    <div id={`${textareaId}-helper`}>
      <Typography variant="body-xs" color={statusMessageColor}>
        {statusMessage}
      </Typography>
    </div>
  );
}

function renderTextAreaCharacterCount({
  textareaId,
  showCharacterCount,
  isOverLimit,
  characterCount,
  maxLength,
}: {
  textareaId: string;
  showCharacterCount: boolean;
  isOverLimit: boolean;
  characterCount: number;
  maxLength: number | undefined;
}) {
  if (!showCharacterCount) return null;
  return (
    <div id={`${textareaId}-count`} className="ml-2 flex-shrink-0">
      <Typography variant="body-xs" color={isOverLimit ? "error" : "muted"}>
        {characterCount}
        {maxLength ? `/${maxLength}` : ""}
      </Typography>
    </div>
  );
}
// TextArea styles using only Tailwind dark mode classes
const textareaStyles = {
  base: "block w-full rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary placeholder-text-secondary disabled:bg-subtle disabled:bg-secondary disabled:text-secondary disabled:cursor-not-allowed",
  statuses: {
    default: "focus:border-text-info ring-text-info",
    error:
      "focus:border-text-error ring-text-error bg-subtle bg-surface-error/20",
    success:
      "focus:border-text-success ring-text-success bg-subtle bg-success/20/20",
    warning:
      "focus:border-text-warning ring-text-warning bg-subtle bg-warning/20/20",
  },
};
/**
 * TextArea Component
 *
 * Features:
 * - Auto-resize based on content
 * - Character counting with limit
 * - Validation states
 * - Dark mode support
 * - Accessibility features
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      status = "default",
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      containerClassName = "",
      labelClassName = "",
      required = false,
      autoResize = false,
      maxLength,
      showCharacterCount = false,
      fullWidth = false,
      disabled = false,
      className = "",
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalRef = resolveInternalRef(ref, textareaRef);
    const textareaId = resolveTextareaId(id);
    // Auto-resize functionality
    useEffect(() => {
      if (!autoResize) return;
      if (!internalRef) return;
      if (typeof internalRef === "function") return;
      const textarea = internalRef.current;
      if (!textarea) return;
      setTextareaAutoHeight(textarea);
    }, [value, autoResize, internalRef]);
    const statusMessage = getStatusMessage({
      status,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
    });
    const statusMessageColor = getStatusMessageColor(status);
    const characterCount = getCharacterCount(value);
    const isOverLimit = getIsOverLimit({ characterCount, maxLength });
    const textareaClasses = buildTextAreaClasses({
      size,
      status,
      autoResize,
      fullWidth,
      className,
    });
    const containerClasses = buildContainerClasses({
      fullWidth,
      containerClassName,
    });
    const labelClasses = buildLabelClasses({
      size,
      labelClassName,
    });
    const describedBy = buildAriaDescribedBy({
      textareaId,
      statusMessage,
      showCharacterCount,
    });
    const labelNode = renderTextAreaLabel({
      label,
      textareaId,
      labelClasses,
      required,
    });
    const helperNode = renderTextAreaHelper({
      textareaId,
      statusMessage,
      statusMessageColor,
    });
    const countNode = renderTextAreaCharacterCount({
      textareaId,
      showCharacterCount,
      isOverLimit,
      characterCount,
      maxLength,
    });

    return (
      <div className={containerClasses}>
        {labelNode}
        <textarea
          ref={internalRef}
          id={textareaId}
          disabled={disabled}
          className={textareaClasses}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={status === "error"}
          {...props}
        />
        <div className="flex justify-between items-start">
          <div className="flex-1">{helperNode}</div>
          {countNode}
        </div>
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
export default TextArea;
