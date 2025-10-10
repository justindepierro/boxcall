import { createContext, useContext } from "react";
import type { SEOMetaData } from "./useSEO";
import { seoConfig } from "../config/seo";

export interface SEOContextType {
  updateSEO: (metadata: SEOMetaData) => void;
  siteConfig: typeof seoConfig;
}

export const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const useSEOContext = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error("useSEOContext must be used within a SEOProvider");
  }
  return context;
};
