/**
 * SkipLinks - Accessibility navigation shortcuts
 * Allows keyboard users to skip to main content, bypassing navigation
 */
import React from "react";

export interface SkipLink {
  id: string;
  label: string;
  target: string; // CSS selector or ID
}

export interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { id: "skip-main", label: "Skip to main content", target: "#main-content" },
  { id: "skip-nav", label: "Skip to navigation", target: "#main-navigation" },
];

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
}) => {
  return (
    <div className="skip-links">
      {links.map((link) => (
        <a key={link.id} href={link.target} className="skip-link">
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;
