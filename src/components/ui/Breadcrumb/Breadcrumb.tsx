import type { ReactNode } from "react";
import React from "react";

export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb item */
  id: string;
  /** Display label for the breadcrumb item */
  label: string;
  /** Optional icon (React component or string) */
  icon?: ReactNode;
  /** Click handler for the breadcrumb item (undefined for current page) */
  onClick?: () => void;
  /** Whether this is the current/active page */
  current?: boolean;
  /** URL href for the breadcrumb item */
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator between breadcrumb items */
  separator?: ReactNode;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
  /** Size of the breadcrumb */
  size?: "sm" | "md" | "lg";
  /** Whether to show icons */
  showIcons?: boolean;
}

const getBreadcrumbStyles = (
  size: BreadcrumbProps["size"]
) => {
  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return `
    flex items-center space-x-1
    ${sizeStyles[size || "md"]}
    text-gray-600 dark:text-gray-300
  `;
};

const getBreadcrumbItemStyles = (item: BreadcrumbItem) => {
  const baseStyles = `
    flex items-center transition-colors duration-200 ease-in-out
  `;

  if (item.current) {
    return `${baseStyles} text-gray-900 dark:text-white font-medium cursor-default`;
  }

  if (item.onClick || item.href) {
    return `${baseStyles} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer hover:underline`;
  }

  return `${baseStyles} text-gray-400 dark:text-gray-500`;
};

const getSeparatorStyles = () => {
  return `
    mx-2 flex-shrink-0
    text-gray-400 dark:text-gray-600
  `;
};

const DefaultSeparator: React.FC = () => (
  <svg
    className={`w-4 h-4 ${getSeparatorStyles()}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const CollapsedIndicator: React.FC<{
  hiddenItems: BreadcrumbItem[];
  onItemClick: (item: BreadcrumbItem) => void;
}> = ({ hiddenItems, onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="relative">
      <button
        className="px-2 py-1 rounded text-sm transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Show hidden breadcrumb items"
      >
        ...
      </button>

      {isExpanded && (
        <div
          className="absolute top-full left-0 mt-1 py-1 z-10 min-w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-md shadow-lg"
        >
          {hiddenItems.map((item) => (
            <button
              key={item.id}
              className="block w-full text-left px-3 py-2 text-sm transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => {
                onItemClick(item);
                setIsExpanded(false);
              }}
            >
              <div className="flex items-center">
                {item.icon && (
                  <span className="mr-2 flex-shrink-0">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BreadcrumbItem: React.FC<{
  item: BreadcrumbItem;
  showIcon: boolean;
  onItemClick: (item: BreadcrumbItem) => void;
}> = ({ item, showIcon, onItemClick }) => {
  const handleClick = () => {
    if (item.current) return;
    onItemClick(item);
  };

  const content = (
    <>
      {showIcon && item.icon && (
        <span className="mr-1 flex-shrink-0">{item.icon}</span>
      )}
      <span>{item.label}</span>
    </>
  );

  if (item.href && !item.current) {
    return (
      <a
        href={item.href}
        className={getBreadcrumbItemStyles(item)}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {content}
      </a>
    );
  }

  if (!item.current && item.onClick) {
    return (
      <button
        className={getBreadcrumbItemStyles(item)}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={getBreadcrumbItemStyles(item)}>{content}</span>
  );
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  maxItems = 4,
  className = "",
  size = "md",
  showIcons = true,
}) => {

  const handleItemClick = (item: BreadcrumbItem) => {
    item.onClick?.();
  };

  // Handle item collapsing
  const shouldCollapse = items.length > maxItems;
  let displayItems = items;
  let hiddenItems: BreadcrumbItem[] = [];

  if (shouldCollapse) {
    // Always show first item, last item, and current item
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const remainingSlots = maxItems - 2; // Reserve slots for first and last

    if (remainingSlots > 0) {
      // Show first item, some middle items, and last item
      const middleItems = items.slice(1, -1);
      const visibleMiddleItems = middleItems.slice(-remainingSlots);
      hiddenItems = middleItems.slice(0, middleItems.length - remainingSlots);

      displayItems = [firstItem, ...visibleMiddleItems, lastItem];
    } else {
      // Only show first and last
      hiddenItems = items.slice(1, -1);
      displayItems = [firstItem, lastItem];
    }
  }

  const renderSeparator = () => {
    return separator || <DefaultSeparator />;
  };

  return (
    <nav
      className={`${getBreadcrumbStyles(size)} ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <li className="flex items-center">
              <BreadcrumbItem
                item={item}
                showIcon={showIcons}
                onItemClick={handleItemClick}
              />
            </li>

            {/* Show separator if not last item */}
            {index < displayItems.length - 1 && (
              <li className="flex items-center">{renderSeparator()}</li>
            )}

            {/* Show collapsed indicator after first item if there are hidden items */}
            {index === 0 && hiddenItems.length > 0 && (
              <>
                <li className="flex items-center">{renderSeparator()}</li>
                <li className="flex items-center">
                  <CollapsedIndicator
                    hiddenItems={hiddenItems}
                    onItemClick={handleItemClick}
                  />
                </li>
              </>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
