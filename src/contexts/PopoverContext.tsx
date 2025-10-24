/**
 * Popover Context
 *
 * Ensures only one popover is open at a time globally
 */

import React, { createContext, useContext, useState, useCallback } from "react";

interface PopoverContextValue {
  activePopoverId: string | null;
  registerPopover: (id: string) => void;
  unregisterPopover: (id: string) => void;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(
  undefined
);

export const PopoverProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  const registerPopover = useCallback((id: string) => {
    setActivePopoverId(id);
  }, []);

  const unregisterPopover = useCallback((id: string) => {
    setActivePopoverId((current) => (current === id ? null : current));
  }, []);

  return (
    <PopoverContext.Provider
      value={{ activePopoverId, registerPopover, unregisterPopover }}
    >
      {children}
    </PopoverContext.Provider>
  );
};

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  // Return a no-op version if provider isn't available (backwards compatibility)
  if (!context) {
    return {
      activePopoverId: null,
      registerPopover: () => {},
      unregisterPopover: () => {},
    };
  }
  return context;
};
