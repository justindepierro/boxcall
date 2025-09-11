/**
 * Collaboration Utilities
 * Helper functions and hooks for collaboration features
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import React, { useContext } from "react";
import {
  CollaborationContext,
  type CollaborationContextValue,
} from "./CollaborationProvider";

/**
 * Hook to access collaboration context
 */
export const useCollaborationContext = (): CollaborationContextValue => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaborationContext must be used within a CollaborationProvider"
    );
  }
  return context;
};

/**
 * HOC for components that need collaboration features
 */
export function withCollaboration<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { collaboration?: CollaborationContextValue }> {
  const CollaborativeComponent = (props: P) => {
    const collaboration = useCollaborationContext();

    return React.createElement(Component, {
      ...props,
      collaboration,
    });
  };

  CollaborativeComponent.displayName = `withCollaboration(${Component.displayName || Component.name})`;

  return CollaborativeComponent;
}
