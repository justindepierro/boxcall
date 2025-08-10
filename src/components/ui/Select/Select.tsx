/**
 * BoxCall Select Component
 *
 * Professional select/dropdown component with search, multi-select, and validation
 */
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../IconButton/IconButton";
import { Typography } from "../../design-system";
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
    base: "relative flex items-center justify-between w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-jade-600 dark:focus:border-blue-400 focus:ring-jade-500 dark:focus:ring-blue-400",
    variants: {
      default: "",
      filled: "bg-gray-50 dark:bg-gray-700",
      outlined: "border-2",
    },
    sizes: {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-3 py-2 text-sm min-h-[40px]",
      lg: "px-4 py-3 text-base min-h-[48px]",
    },
    statuses: {
      default: "",
      error:
        "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 bg-red-50 dark:bg-red-900/20",
      success:
        "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 bg-green-50 dark:bg-green-900/20",
      warning:
        "border-yellow-300 dark:border-yellow-600 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    },
    states: {
      disabled: "opacity-50 cursor-not-allowed",
      loading: "opacity-75",
      open: "ring-2 ring-offset-2",
    },
  },
  menu: {
    base: "absolute z-50 w-full mt-1 rounded-md border shadow-lg overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600",
    positions: {
      top: "bottom-full mb-1 mt-0",
      bottom: "top-full mt-1",
    },
    maxHeight: "max-h-60 overflow-y-auto",
  },
  option: {
    base: "flex items-center px-3 py-2 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700",
    states: {
      default: "",
      highlighted:
        "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      selected:
        "font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
      disabled: "opacity-50 cursor-not-allowed",
    },
    withIcon: "pl-10",
  },
  input: {
    base: "flex-1 bg-transparent border-none outline-none placeholder-gray-500 dark:placeholder-gray-400",
    sizes: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
  },
  placeholder: "text-gray-500 dark:text-gray-400",
  noOptions: "px-3 py-2 text-gray-500 dark:text-gray-400 text-center italic",
  loading: "px-3 py-2 text-center text-gray-500 dark:text-gray-400",
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
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
            <Typography
              variant="label-md"
              className="text-gray-900 dark:text-white"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
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
                  className={`${selectStyles.option.base} border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`}
                  onClick={() => onCreateOption?.(searchTerm)}
                >
                  <span className="text-blue-600">Create "{searchTerm}"</span>
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
