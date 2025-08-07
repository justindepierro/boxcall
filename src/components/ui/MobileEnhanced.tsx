/**
 * Mobile-Enhanced UI Components
 * Part of Phase 3C: Professional Touch Experience
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronRight, X, Search } from 'lucide-react';
import { Typography } from '../design-system/Typography';
import { TouchFeedback } from './TouchFeedback';
import { HapticPatterns } from '../../utils/touchUtils';

// Mobile-optimized list item
interface MobileListItemProps {
  /** Primary content */
  title: string;
  /** Secondary content */
  subtitle?: string;
  /** Leading icon or avatar */
  leading?: React.ReactNode;
  /** Trailing content */
  trailing?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

const MobileListItem: React.FC<MobileListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  showChevron = false,
  selected = false,
  disabled = false,
  className = '',
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      HapticPatterns.light();
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <TouchFeedback
      className={`
        flex items-center space-x-3 p-4 transition-colors min-h-[56px]
        ${selected ? 'bg-team-primary/10' : 'bg-white'}
        ${disabled ? 'opacity-50' : 'hover:bg-gray-50'}
        ${className}
      `}
      onPress={handleClick}
      disabled={disabled}
    >
      {leading && (
        <div className="flex-shrink-0">
          {leading}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <Typography 
          variant="body-md" 
          className={`truncate ${selected ? 'text-team-primary font-medium' : 'text-gray-900'}`}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body-sm" className="text-gray-500 truncate">
            {subtitle}
          </Typography>
        )}
      </div>
      
      {trailing && (
        <div className="flex-shrink-0">
          {trailing}
        </div>
      )}
      
      {showChevron && (
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      )}
    </TouchFeedback>
  );
};

// Mobile-optimized button group
interface MobileButtonGroupProps {
  /** Button options */
  options: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  /** Selected option ID */
  selected?: string;
  /** Selection handler */
  onSelect: (id: string) => void;
  /** Multiple selection mode */
  multiple?: boolean;
  /** Selected options for multiple mode */
  selectedOptions?: string[];
  /** Vertical layout */
  vertical?: boolean;
  /** Custom className */
  className?: string;
}

const MobileButtonGroup: React.FC<MobileButtonGroupProps> = ({
  options,
  selected,
  onSelect,
  multiple = false,
  selectedOptions = [],
  vertical = false,
  className = '',
}) => {
  const handleSelect = useCallback((id: string) => {
    HapticPatterns.medium();
    onSelect(id);
  }, [onSelect]);

  const isSelected = (id: string) => {
    return multiple ? selectedOptions.includes(id) : selected === id;
  };

  return (
    <div className={`
      flex ${vertical ? 'flex-col' : 'flex-row'} 
      ${vertical ? 'space-y-1' : 'space-x-1'} 
      p-1 bg-gray-100 rounded-lg
      ${className}
    `}>
      {options.map((option) => {
        const selected = isSelected(option.id);
        return (
          <TouchFeedback
            key={option.id}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all
              ${selected 
                ? 'bg-white shadow-sm text-team-primary' 
                : 'text-gray-600 hover:text-gray-900'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onPress={() => !option.disabled && handleSelect(option.id)}
            disabled={option.disabled}
          >
            {option.icon && (
              <span className={`text-sm ${selected ? 'text-team-primary' : 'text-current'}`}>
                {option.icon}
              </span>
            )}
            <Typography 
              variant="body-sm" 
              className={`font-medium ${selected ? 'text-team-primary' : 'text-current'}`}
            >
              {option.label}
            </Typography>
          </TouchFeedback>
        );
      })}
    </div>
  );
};

// Mobile-optimized search input
interface MobileSearchInputProps {
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus */
  autoFocus?: boolean;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel handler */
  onCancel?: () => void;
  /** Custom className */
  className?: string;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  autoFocus = false,
  showCancel = false,
  onCancel,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    HapticPatterns.light();
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
    HapticPatterns.light();
  }, [onChange]);

  const handleCancel = useCallback(() => {
    onChange('');
    inputRef.current?.blur();
    onCancel?.();
    HapticPatterns.medium();
  }, [onChange, onCancel]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`
        flex-1 relative flex items-center bg-gray-100 rounded-lg transition-all
        ${isFocused ? 'bg-white ring-2 ring-team-primary/20' : ''}
      `}>
        <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-gray-900 placeholder-gray-500"
        />
        
        {value && (
          <TouchFeedback
            className="p-1 mr-2 rounded-full hover:bg-gray-200"
            onPress={handleClear}
          >
            <X className="h-4 w-4 text-gray-400" />
          </TouchFeedback>
        )}
      </div>
      
      {showCancel && (
        <TouchFeedback
          className="px-3 py-2 text-team-primary font-medium"
          onPress={handleCancel}
        >
          <Typography variant="body-md" className="text-current">
            Cancel
          </Typography>
        </TouchFeedback>
      )}
    </div>
  );
};

// Mobile-optimized modal bottom sheet
interface MobileBottomSheetProps {
  /** Show state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Sheet height */
  height?: 'auto' | 'half' | 'full';
  /** Sheet content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  height = 'auto',
  children,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setDragY(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = Math.max(0, currentY - startY); // Only allow dragging down
    setDragY(deltaY);
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Close if dragged down more than 100px
    if (dragY > 100) {
      onClose();
    }

    setDragY(0);
  }, [isDragging, dragY, onClose]);

  const handleBackdropClick = useCallback(() => {
    HapticPatterns.light();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl
          ${heightClasses[height]} ${className}
        `}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 pb-4 border-b border-gray-200">
            <Typography variant="headline-md" className="text-gray-900 text-center">
              {title}
            </Typography>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized floating action button
interface MobileFABProps {
  /** Primary action */
  onClick: () => void;
  /** Button icon */
  icon: React.ReactNode;
  /** Button position */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Extended state with label */
  extended?: boolean;
  /** Label for extended state */
  label?: string;
  /** Hide state */
  hidden?: boolean;
  /** Custom className */
  className?: string;
}

const MobileFAB: React.FC<MobileFABProps> = ({
  onClick,
  icon,
  position = 'bottom-right',
  extended = false,
  label,
  hidden = false,
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  const handleClick = useCallback(() => {
    HapticPatterns.medium();
    onClick();
  }, [onClick]);

  return (
    <TouchFeedback
      className={`
        fixed z-40 bg-team-primary text-white shadow-lg
        ${extended ? 'px-4 py-3 rounded-full' : 'p-4 rounded-full w-14 h-14'}
        ${positionClasses[position]}
        ${hidden ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
        transition-all duration-300 flex items-center space-x-2
        ${className}
      `}
      onPress={handleClick}
    >
      {icon}
      {extended && label && (
        <Typography variant="body-md" className="text-white font-medium">
          {label}
        </Typography>
      )}
    </TouchFeedback>
  );
};

export {
  MobileListItem,
  MobileButtonGroup,
  MobileSearchInput,
  MobileBottomSheet,
  MobileFAB,
};
