/**
 * Progressive Loading Higher-Order Component
 *
 * A HOC that wraps components with progressive loading capabilities.
 */

import React from "react";
import { ProgressiveComponent } from "./ProgressiveComponent";
import type { ProgressiveLoadingOptions } from "../hooks/useProgressiveLoading";

export const withProgressiveLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  options: ProgressiveLoadingOptions = {}
) => {
  return React.memo(
    (
      props: P & {
        loadingOptions?: ProgressiveLoadingOptions;
        loadingFallback?: React.ReactNode;
        errorFallback?: React.ReactNode;
        onLoad?: () => void;
        onError?: (error: Error) => void;
      }
    ) => {
      const {
        loadingOptions = options,
        loadingFallback,
        errorFallback,
        onLoad,
        onError,
        ...componentProps
      } = props;

      return (
        <ProgressiveComponent
          lazyComponent={LazyComponent}
          componentProps={componentProps}
          loadingOptions={loadingOptions}
          loadingFallback={loadingFallback}
          errorFallback={errorFallback}
          onLoad={onLoad}
          onError={onError}
        />
      );
    }
  );
};
