import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

import { Typography } from "../../design-system";
/**
 * BoxCall Select Component
 *
 * Professional select/dropdown component with search, multi-select, and validation
 */
import { IconButton } from "../IconButton/IconButton";

import type {
  SelectOption,
  SelectProps,
  SelectStylesConfig,
} from "./Select.types";
// Select styles configuration using only Tailwind dark mode classes
const selectStyles: SelectStylesConfig = {
  container: {
    base: "relative",
    sizes: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
    fullWidth: "w-full",
  },
  trigger: {
    base: "relative flex items-center justify-between w-full rounded-lg border-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer surface-card text-primary ring-text-info",
    variants: {
      default: "",
      filled: "bg-subtle bg-secondary",
      outlined: "border-2",
    },
    sizes: {
      sm: "px-3 py-1.5 text-sm min-h-8",
      md: "px-3 py-2 text-sm min-h-10",
      lg: "px-4 py-3 text-base min-h-12",
    },
    statuses: {
      default: "",
      error:
        "border-text-error focus:border-text-error ring-text-error bg-subtle bg-surface-error/20",
      success:
        "border-text-success focus:border-text-success ring-text-success bg-subtle bg-success/20/20",
      warning:
        "border-text-warning focus:border-text-warning ring-text-warning bg-subtle bg-warning/20/20",
    },
    states: {
      disabled: "opacity-50 cursor-not-allowed",
      loading: "opacity-75",
      open: "ring-2 ring-offset-2",
    },
  },
  menu: {
    base: "absolute z-50 w-full mt-1 rounded-lg border-muted elevation-dropdown overflow-hidden surface-card",
    positions: {
      top: "bottom-full mb-1 mt-0",
      bottom: "top-full mt-1",
    },
    maxHeight: "max-h-60 overflow-y-auto",
  },
  option: {
    base: "flex items-center px-3 py-2 cursor-pointer transition-colors duration-150 text-primary hover:bg-muted",
    states: {
      default: "",
      highlighted: "bg-subtle bg-info/20/30 text-info",
      selected: "font-medium bg-info/20 text-info",
      disabled: "opacity-50 cursor-not-allowed",
    },
    withIcon: "pl-10",
  },
  input: {
    base: "flex-1 bg-primary border-none outline-none placeholder-text-secondary",
    sizes: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
  },
  placeholder: "text-secondary",
  noOptions: "px-3 py-2 text-secondary text-center italic",
  loading: "px-3 py-2 text-center text-secondary",
};
/**
 * Select Component
 *
 * A professional select component with comprehensive features:
 * - Single and multi-select modes
 * - Searchable options with filtering
 * - Validation states (error, success, warning)
 * - Custom option rendering with icons
 * - Keyboard navigation support
 * - Dark mode integration
 * - Option grouping
 * - Create new options functionality
 */
const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      onSearch,
      placeholder = "Select an option...",
      multiple = false,
      searchable = false,
      clearable = false,
      disabled = false,
      loading = false,
      status = "default",
      required = false,
      size = "md",
      fullWidth = false,
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      maxHeight = 240,
      createOption = false,
      onCreateOption,
      noOptionsMessage = "No options available",
      id,
      className = "",
      containerClassName = "",
      labelClassName = "",
      menuClassName = "",
      optionClassName = "",
      ...props
    },
    ref
  ) => {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [internalValue, setInternalValue] = useState(
      value || defaultValue || (multiple ? [] : "")
    );
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    // Generate unique ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    // Sync internal value with prop value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);
    // Filter options based on search term
    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);
    // Get selected option(s) for display
    const selectedOptions = useMemo(() => {
      if (multiple && Array.isArray(internalValue)) {
        return options.filter((option) => internalValue.includes(option.value));
      } else if (!multiple && internalValue !== "") {
        return options.find((option) => option.value === internalValue);
      }
      return multiple ? [] : null;
    }, [options, internalValue, multiple]);
    // Handle option selection
    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return;
      let newValue;
      if (multiple && Array.isArray(internalValue)) {
        if (internalValue.includes(option.value)) {
          newValue = internalValue.filter((v) => v !== option.value);
        } else {
          newValue = [...internalValue, option.value];
        }
      } else {
        newValue = option.value;
        setIsOpen(false);
      }
      setInternalValue(newValue);
      onChange?.(newValue);
      if (!multiple) {
        setSearchTerm("");
      }
    };
    // Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      setHighlightedIndex(-1);
      onSearch?.(term);
    };
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (
            isOpen &&
            highlightedIndex >= 0 &&
            filteredOptions[highlightedIndex]
          ) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    };
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Auto-scroll highlighted option into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && menuRef.current) {
        const highlightedElement = menuRef.current.children[
          highlightedIndex
        ] as HTMLElement;
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen]);
    // Get status message
    const getStatusMessage = () => {
      if (status === "error" && errorMessage) return errorMessage;
      if (status === "success" && successMessage) return successMessage;
      if (status === "warning" && warningMessage) return warningMessage;
      return helperText;
    };
    // Get status message color
    const getStatusMessageColor = () => {
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
    };
    // Build component classes
    const containerClasses = [
      selectStyles.container.base,
      selectStyles.container.sizes[size],
      fullWidth ? selectStyles.container.fullWidth : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");
    const triggerClasses = [
      selectStyles.trigger.base,
      selectStyles.trigger.statuses[status],
      selectStyles.trigger.sizes[size],
      disabled ? selectStyles.trigger.states.disabled : "",
      loading ? selectStyles.trigger.states.loading : "",
      isOpen ? selectStyles.trigger.states.open : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const menuClasses = [
      selectStyles.menu.base,
      selectStyles.menu.maxHeight,
      menuClassName,
    ]
      .filter(Boolean)
      .join(" ");
    // Render selected value display
    const renderSelectedValue = () => {
      if (loading) {
        return <span className={selectStyles.placeholder}>Loading...</span>;
      }
      if (
        multiple &&
        Array.isArray(selectedOptions) &&
        selectedOptions.length > 0
      ) {
        if (selectedOptions.length === 1) {
          return <span>{selectedOptions[0].label}</span>;
        }
        return <span>{selectedOptions.length} options selected</span>;
      } else if (!multiple && selectedOptions) {
        return <span>{(selectedOptions as SelectOption).label}</span>;
      } else if (searchable && isOpen && searchTerm) {
        return null; // Input will show the search term
      }
      return <span className={selectStyles.placeholder}>{placeholder}</span>;
    };
    // Render option with proper styling
    const renderOption = (option: SelectOption, index: number) => {
      const isSelected = multiple
        ? Array.isArray(internalValue) && internalValue.includes(option.value)
        : internalValue === option.value;
      const isHighlighted = index === highlightedIndex;
      const optionClasses = [
        selectStyles.option.base,
        isHighlighted ? selectStyles.option.states.highlighted : "",
        isSelected ? selectStyles.option.states.selected : "",
        option.disabled ? selectStyles.option.states.disabled : "",
        option.icon ? selectStyles.option.withIcon : "",
        optionClassName,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div
          key={option.value}
          className={optionClasses}
          onClick={() => !option.disabled && handleOptionSelect(option)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
        >
          {option.icon && (
            <span className="absolute left-3 flex items-center">
              {option.icon}
            </span>
          )}
          <div className="flex-1">
            <div>{option.label}</div>
            {option.description && (
              <div className="text-xs text-secondary">{option.description}</div>
            )}
          </div>
          {isSelected && (
            <span className="ml-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      );
    };
    return (
      <div className={containerClasses} ref={containerRef}>
        {label && (
          <label htmlFor={selectId} className={labelClassName}>
            <Typography variant="label-md" className="text-primary">
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </Typography>
          </label>
        )}
        <div
          ref={ref}
          className={triggerClasses}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-required={required}
          aria-invalid={status === "error"}
          aria-describedby={
            getStatusMessage() ? `${selectId}-helper` : undefined
          }
          tabIndex={disabled ? -1 : 0}
          {...props}
        >
          <div className="flex-1 flex items-center min-w-0">
            {searchable && isOpen ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className={`${selectStyles.input.base} ${selectStyles.input.sizes[size]}`}
                autoFocus
              />
            ) : (
              <div className="truncate">{renderSelectedValue()}</div>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {clearable && internalValue && !disabled && (
              <IconButton
                aria-label="Clear selection"
                tooltip="Clear selection"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  const newValue = multiple ? [] : "";
                  setInternalValue(newValue);
                  onChange?.(newValue);
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            )}
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-jade-600 border-t-transparent" />
            ) : (
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>
        {isOpen && (
          <div
            ref={menuRef}
            className={menuClasses}
            style={{ maxHeight: maxHeight }}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) =>
                renderOption(option, index)
              )
            ) : (
              <div className={selectStyles.noOptions}>
                {searchTerm
                  ? `No options match "${searchTerm}"`
                  : noOptionsMessage}
              </div>
            )}
            {createOption &&
              searchTerm &&
              !filteredOptions.some(
                (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase()
              ) && (
                <div
                  className={`${selectStyles.option.base} border-t border-muted`}
                  onClick={() => onCreateOption?.(searchTerm)}
                >
                  <span className="text-info">Create "{searchTerm}"</span>
                </div>
              )}
          </div>
        )}
        {getStatusMessage() && (
          <div id={`${selectId}-helper`} className="mt-1">
            <Typography variant="body-xs" color={getStatusMessageColor()}>
              {getStatusMessage()}
            </Typography>
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
