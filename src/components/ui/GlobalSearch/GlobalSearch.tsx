/**
 * GlobalSearch Component
 *
 * A premium search interface that searches across all content types
 * including plays, formations, players, announcements, game plans,
 * practice scripts, calendar events, and equipment.
 *
 * Features:
 * - Blazing fast parallel searches with abort support
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Global shortcut (Cmd+K / Ctrl+K)
 * - Desktop dropdown and mobile full-screen modal
 * - Memoized results for performance
 */

import React from 'react';
import type { GlobalSearchProps } from './types';
import { useGlobalSearch } from './useGlobalSearch';
import {
  MobileSearchButton,
  DesktopSearchField,
  MobileSearchModal,
} from './components';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = '',
}) => {
  const {
    // State
    query,
    results,
    isOpen,
    isLoading,
    selectedIndex,
    isMobileModalOpen,

    // Refs
    inputRef,
    mobileInputRef,
    containerRef,

    // Handlers
    handleInputChange,
    handleKeyDown,
    handleResultClick,
    handleMobileSearchOpen,
    handleMobileSearchClose,
    handleFocus,
    handleBlur,
    handleClear,
    handleMobileClear,

    // Helpers
    getTypeIcon,
    getTypeColor,
  } = useGlobalSearch();

  return (
    <>
      {/* Mobile/Tablet: Search Button */}
      <MobileSearchButton
        onClick={handleMobileSearchOpen}
        className={className}
      />

      {/* Desktop: Full Search Field */}
      <DesktopSearchField
        query={query}
        isOpen={isOpen}
        isLoading={isLoading}
        results={results}
        selectedIndex={selectedIndex}
        inputRef={inputRef}
        containerRef={containerRef}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClear}
        onResultClick={handleResultClick}
        getTypeIcon={getTypeIcon}
        getTypeColor={getTypeColor}
        className={className}
      />

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={isMobileModalOpen}
        query={query}
        isLoading={isLoading}
        results={results}
        selectedIndex={selectedIndex}
        inputRef={mobileInputRef}
        onClose={handleMobileSearchClose}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClear={handleMobileClear}
        onResultClick={handleResultClick}
        getTypeIcon={getTypeIcon}
        getTypeColor={getTypeColor}
      />
    </>
  );
};
