/**
 * FormationTemplateSelector - Browse and Insert NFL Formation Templates
 *
 * Dropdown component that allows coaches to quickly insert professional
 * formation templates into their playbook. Templates include standard
 * NFL formations with correct positioning and depths.
 *
 * Features:
 * - 10 professional formations grouped by category
 * - Shows formation name, description, and personnel
 * - One-click insert into playbook
 * - Organized by: Shotgun, Under Center, Pistol, Specialty
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { ChevronDown, Sparkles, Users, Info } from "lucide-react";
import {
  FORMATION_TEMPLATES,
  getTemplatesByCategory,
  type FormationTemplate,
} from "../../data/formationTemplates";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface FormationTemplateSelectorProps {
  onSelectTemplate: (template: FormationTemplate) => void;
  disabled?: boolean;
  className?: string;
}

export function FormationTemplateSelector({
  onSelectTemplate,
  disabled = false,
  className = "",
}: FormationTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleTemplateClick = (template: FormationTemplate) => {
    triggerHapticFeedback("medium");
    onSelectTemplate(template);
    setIsOpen(false);
  };

  const categoryGroups = [
    {
      category: "shotgun" as const,
      label: "Shotgun Formations",
      icon: "🏈",
      description: "Spread offense, passing focus",
    },
    {
      category: "under-center" as const,
      label: "Under Center",
      icon: "💪",
      description: "Power running, I-formations",
    },
    {
      category: "pistol" as const,
      label: "Pistol",
      icon: "🔫",
      description: "Read option, dual-threat",
    },
    {
      category: "specialty" as const,
      label: "Specialty",
      icon: "⚡",
      description: "Goal line, wildcat, trick plays",
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        onClick={() => {
          triggerHapticFeedback("light");
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        variant="secondary"
        className="w-full flex items-center justify-between gap-spacing-sm"
      >
        <div className="flex items-center gap-spacing-sm">
          <Sparkles className="w-4 h-4" />
          <span>Insert NFL Template</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-spacing-sm w-full max-w-md bg-surface-primary border border-border-primary rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-surface-secondary border-b border-border-primary p-spacing-md">
            <div className="flex items-start gap-spacing-sm">
              <Info className="w-4 h-4 text-info-500 flex-shrink-0 mt-0.5" />
              <div>
                <Typography
                  variant="body-sm"
                  className="text-text-secondary leading-snug"
                >
                  Choose from 10 professional NFL formations with correct
                  positioning and depths. Select a template to create a new
                  formation.
                </Typography>
              </div>
            </div>
          </div>

          {/* Category Groups */}
          <div className="p-spacing-sm">
            {categoryGroups.map((group) => {
              const templates = getTemplatesByCategory(group.category);
              if (templates.length === 0) return null;

              return (
                <div key={group.category} className="mb-spacing-md last:mb-0">
                  {/* Category Header */}
                  <div className="px-spacing-sm py-spacing-xs bg-surface-muted rounded-md mb-spacing-xs">
                    <div className="flex items-center gap-spacing-xs">
                      <span className="text-base">{group.icon}</span>
                      <Typography
                        variant="label-md"
                        className="font-semibold text-text-primary"
                      >
                        {group.label}
                      </Typography>
                      <span className="text-xs text-text-muted">
                        ({templates.length})
                      </span>
                    </div>
                    <Typography
                      variant="caption"
                      className="text-text-muted ml-6"
                    >
                      {group.description}
                    </Typography>
                  </div>

                  {/* Templates in Category */}
                  <div className="space-y-spacing-xs">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className="w-full text-left p-spacing-sm rounded-md hover:bg-surface-muted transition-colors border border-transparent hover:border-border-primary group"
                      >
                        <div className="flex items-start justify-between gap-spacing-sm">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-spacing-xs mb-spacing-xs">
                              <Typography
                                variant="body-md"
                                className="font-medium text-text-primary group-hover:text-primary-600 transition-colors"
                              >
                                {template.name}
                              </Typography>
                              {/* Personnel Badge */}
                              <span className="inline-flex items-center gap-0.5 px-spacing-xs py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                                <Users className="w-3 h-3" />
                                {template.personnel}
                              </span>
                            </div>
                            <Typography
                              variant="caption"
                              className="text-text-secondary line-clamp-2"
                            >
                              {template.description}
                            </Typography>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-surface-secondary border-t border-border-primary p-spacing-sm">
            <Typography
              variant="caption"
              className="text-text-muted text-center"
            >
              {FORMATION_TEMPLATES.length} professional templates available
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}
