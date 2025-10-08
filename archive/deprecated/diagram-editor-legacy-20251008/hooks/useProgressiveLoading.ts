/**
 * useProgressiveLoading Hook
 *
 * Manages progressive loading of components based on user interaction,
 * viewport visibility, and performance metrics.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProgressiveLoadingOptions {
  /** Delay before loading (ms) */
  delay?: number;
  /** Load when element enters viewport */
  loadOnViewport?: boolean;
  /** Load on user interaction */
  loadOnInteraction?: boolean;
  /** Load after other components are loaded */
  loadAfterPriority?: boolean;
  /** Priority level (higher = load first) */
  priority?: number;
}

export interface ProgressiveLoadingState {
  shouldLoad: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  ref: React.RefObject<Element | null>;
  onInteraction: () => void;
}

export const useProgressiveLoading = (
  options: ProgressiveLoadingOptions = {}
): ProgressiveLoadingState & {
  ref: React.RefObject<Element | null>;
  onInteraction: () => void;
} => {
  const {
    delay = 0,
    loadOnViewport = false,
    loadOnInteraction = false,
    loadAfterPriority = false,
    priority = 0
  } = options;

  const [state, setState] = useState<Omit<ProgressiveLoadingState, 'ref' | 'onInteraction'>>({
    shouldLoad: false,
    isLoading: false,
    isLoaded: false,
    error: null
  });

  const elementRef = useRef<Element | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for viewport loading
  useEffect(() => {
    if (!loadOnViewport) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, shouldLoad: true }));
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1, // Load when 10% visible
        rootMargin: '50px' // Load 50px before entering viewport
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadOnViewport]);

  // Set up delay-based loading
  useEffect(() => {
    if (delay > 0 && !loadOnViewport && !loadOnInteraction) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, shouldLoad: true }));
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay, loadOnViewport, loadOnInteraction]);

  // Handle user interaction loading
  const handleInteraction = useCallback(() => {
    if (loadOnInteraction) {
      setState(prev => ({ ...prev, shouldLoad: true }));
    }
  }, [loadOnInteraction]);

  // Priority-based loading (would be coordinated by a central manager)
  useEffect(() => {
    if (loadAfterPriority && priority > 0) {
      // This would be enhanced with a global loading coordinator
      const priorityDelay = (10 - priority) * 100; // Higher priority = shorter delay
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, shouldLoad: true }));
      }, priorityDelay);
    }
  }, [loadAfterPriority, priority]);

  // Simulate loading state
  useEffect(() => {
    if (state.shouldLoad && !state.isLoaded) {
      setState(prev => ({ ...prev, isLoading: true }));

      // Simulate async loading (in real usage, this would be the actual import)
      const loadingTimeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isLoaded: true
        }));
      }, 100); // Simulate loading time

      return () => clearTimeout(loadingTimeout);
    }
  }, [state.shouldLoad, state.isLoaded]);

  return {
    ...state,
    // Expose ref for viewport observation
    ref: elementRef,
    // Expose interaction handler
    onInteraction: handleInteraction
  };
};