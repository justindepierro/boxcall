/**
 * MobileSearchButton Component
 *
 * Button that opens the mobile search modal.
 */

import React from 'react';
import { Icon } from '../../Icon';
import { MobileSearchButtonProps } from '../types';

export const MobileSearchButton: React.FC<MobileSearchButtonProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`md:hidden flex items-center justify-center gap-2 px-4 py-2.5 min-w-28
        bg-gradient-to-r from-jade-500 to-jade-600
        hover:from-jade-600 hover:to-jade-700
        active:scale-95
        border-2 border-jade-600
        rounded-xl shadow-md hover:shadow-lg
        transition-all duration-200 ease-out
        ${className}`}
    >
      <Icon name="search" className="h-5 w-5 text-white" />
      <span className="text-base font-semibold text-white">Search</span>
    </button>
  );
};
