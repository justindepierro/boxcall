import { FormationIcon } from "./FormationIcon";

export interface Formation {
  id: string;
  name: string;
  description: string;
  category: "spread" | "pro" | "power" | "special";
  iconType:
    | "spread2x2"
    | "spread3x1Right"
    | "spread3x1Left"
    | "pro"
    | "pistol"
    | "trips";
}

interface FormationPickerProps {
  onSelect: (formationId: string) => void;
  selectedFormation?: string;
  gridColumns?: 2 | 3 | 4;
}

/**
 * FormationPicker - Visual formation selector with SVG icons
 *
 * Features:
 * - Grid layout (default 3 columns on mobile)
 * - Visual SVG thumbnails
 * - Category badges
 * - Touch-optimized cards
 * - Instant selection feedback
 */
export function FormationPicker({
  onSelect,
  selectedFormation,
  gridColumns = 3,
}: FormationPickerProps) {
  const formations: Formation[] = [
    {
      id: "spread2x2",
      name: "Spread 2x2",
      description: "Shotgun, 2 WR each side",
      category: "spread",
      iconType: "spread2x2",
    },
    {
      id: "spread3x1Right",
      name: "Spread 3x1 Right",
      description: "Shotgun, 3 WR right",
      category: "spread",
      iconType: "spread3x1Right",
    },
    {
      id: "spread3x1Left",
      name: "Spread 3x1 Left",
      description: "Shotgun, 3 WR left",
      category: "spread",
      iconType: "spread3x1Left",
    },
    {
      id: "pro",
      name: "Pro Set",
      description: "Under center, balanced",
      category: "pro",
      iconType: "pro",
    },
    {
      id: "pistol",
      name: "Pistol",
      description: "Pistol backfield",
      category: "power",
      iconType: "pistol",
    },
    {
      id: "trips",
      name: "Trips Right",
      description: "3 WR bunch right",
      category: "special",
      iconType: "trips",
    },
  ];

  const categoryColors = {
    spread: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    pro: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    power:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    special:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };

  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[gridColumns];

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {formations.map((formation) => {
        const isSelected = selectedFormation === formation.id;

        return (
          <button
            key={formation.id}
            onClick={() => onSelect(formation.id)}
            className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all touch-manipulation ${
              isSelected
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-95"
                : "border-border bg-surface-secondary hover:border-primary-300 hover:bg-surface-tertiary active:scale-95"
            }`}
            aria-label={`Select ${formation.name} formation`}
            aria-pressed={isSelected}
          >
            {/* SVG Formation Icon */}
            <div className="mb-2">
              <FormationIcon type={formation.iconType} size={64} />
            </div>

            {/* Formation Name */}
            <div className="text-xs font-semibold text-primary text-center leading-tight">
              {formation.name}
            </div>

            {/* Category Badge */}
            <div
              className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[formation.category]}`}
            >
              {formation.category}
            </div>

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
