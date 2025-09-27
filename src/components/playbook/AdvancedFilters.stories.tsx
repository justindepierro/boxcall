import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { AdvancedFilters } from "./AdvancedFilters";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const meta: Meta<typeof AdvancedFilters> = {
  title: "Features/Playbook/AdvancedFilters",
  component: AdvancedFilters,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Advanced filtering component for playbook plays with support for multiple filter criteria.

**Features:**
- Dynamic filter addition with field selection
- Multiple input types (text, select, number, date)
- Active filter display with easy removal
- Compact, collapsible UI design
- Support for complex play attributes

**Usage:**
\`\`\`tsx
import { AdvancedFilters } from './components/playbook/AdvancedFilters';

function PlaybookFilters({ onFiltersChange }) {
  const [activeFilters, setActiveFilters] = useState([]);

  return (
    <AdvancedFilters
      activeFilters={activeFilters}
      onFiltersChange={setActiveFilters}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// AdvancedFilters Demo Component
const AdvancedFiltersDemo = (args: any) => {
  const [activeFilters, setActiveFilters] = React.useState<any[]>([]);

  const handleFiltersChange = (filters: any[]) => {
    setActiveFilters(filters);
    console.log("Filters changed:", filters);
  };

  const mockFilteredResults = React.useMemo(() => {
    // Mock filtering logic based on active filters
    const baseResults = 42;
    const reduction = activeFilters.length * 8;
    return Math.max(0, baseResults - reduction);
  }, [activeFilters]);

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            AdvancedFilters Component
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Dynamic filtering system with multiple criteria and input types for
            playbook plays.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="info">Active Filters: {activeFilters.length}</Badge>
          <Badge variant="success">Results: {mockFilteredResults}</Badge>
          <Button
            onClick={() => setActiveFilters([])}
            variant="outline"
            size="sm"
            disabled={activeFilters.length === 0}
          >
            Clear All
          </Button>
        </div>

        {/* AdvancedFilters Component */}
        <div className="border rounded-lg p-4 bg-white">
          <AdvancedFilters
            {...args}
            activeFilters={activeFilters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Active Filters</h4>
            <div className="space-y-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{filter.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Field: {filter.field} | Operator: {filter.operator} |
                        Value:{" "}
                        {Array.isArray(filter.value)
                          ? filter.value.join(", ")
                          : filter.value}
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handleFiltersChange(
                          activeFilters.filter((f) => f.id !== filter.id)
                        )
                      }
                      variant="ghost"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component Features */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Filter Types</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Text fields (Name, Description, Personnel, Tags)</div>
                <div>• Select dropdowns (Formation, Play Type, Category)</div>
                <div>
                  • Number inputs (Success Rate, Yards/Play, Times Used)
                </div>
                <div>• Date pickers (Last Used, Created, Updated)</div>
                <div>• Multi-select options for complex criteria</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Available Fields</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Formation (Shotgun, Pistol, Wildcat, etc.)</div>
                <div>• Play Type (Pass, Run, RPO, Special)</div>
                <div>• Category (Run, Pass, RPO, Play Action)</div>
                <div>• Complexity (Basic, Intermediate, Advanced)</div>
                <div>• Down & Distance (1st-4th down, yardage)</div>
                <div>• Field Position (Red Zone, Midfield, Goal Line)</div>
                <div>• Performance metrics (Success Rate, Yards/Play)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Props</h4>
          <div className="text-sm space-y-2 text-gray-600">
            <div>
              <code>onFiltersChange: (filters) =&gt; void</code> - Callback when
              filters change
            </div>
            <div>
              <code>activeFilters: ActiveFilter[]</code> - Array of currently
              active filters
            </div>
          </div>
          <div className="text-sm space-y-2 text-gray-600 mt-4">
            <div>
              <strong>ActiveFilter interface:</strong>
            </div>
            <div>
              <code>id: string</code> - Unique filter identifier
            </div>
            <div>
              <code>field: string</code> - Field name being filtered
            </div>
            <div>
              <code>operator: "equals" | "contains" | "in"</code> - Filter
              operator
            </div>
            <div>
              <code>value: string | string[]</code> - Filter value(s)
            </div>
            <div>
              <code>label: string</code> - Human-readable filter description
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage Examples</h4>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Basic Usage</h5>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {`const [activeFilters, setActiveFilters] = useState([]);

<AdvancedFilters
  activeFilters={activeFilters}
  onFiltersChange={setActiveFilters}
/>`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">
                With Filter Application
              </h5>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {`function PlaybookGrid({ plays }) {
  const [filters, setFilters] = useState([]);

  const filteredPlays = useMemo(() => {
    return plays.filter(play => {
      return filters.every(filter => {
        // Apply filter logic based on filter.field, filter.operator, filter.value
        return matchesFilter(play, filter);
      });
    });
  }, [plays, filters]);

  return (
    <>
      <AdvancedFilters
        activeFilters={filters}
        onFiltersChange={setFilters}
      />
      <div>{filteredPlays.length} plays found</div>
    </>
  );
}`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Filter Persistence</h5>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {`function PersistentFilters() {
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('playbook-filters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('playbook-filters', JSON.stringify(filters));
  }, [filters]);

  return (
    <AdvancedFilters
      activeFilters={filters}
      onFiltersChange={setFilters}
    />
  );
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Demo Interactions */}
        <div className="space-y-4">
          <h4 className="font-medium">Demo Interactions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Quick Add Filters</h5>
              <div className="space-y-2">
                <Button
                  onClick={() =>
                    handleFiltersChange([
                      ...activeFilters,
                      {
                        id: Date.now().toString(),
                        field: "formation",
                        operator: "equals",
                        value: "Shotgun",
                        label: 'Formation equals "Shotgun"',
                      },
                    ])
                  }
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Add Formation Filter
                </Button>
                <Button
                  onClick={() =>
                    handleFiltersChange([
                      ...activeFilters,
                      {
                        id: (Date.now() + 1).toString(),
                        field: "playType",
                        operator: "equals",
                        value: "Pass",
                        label: 'Play Type equals "Pass"',
                      },
                    ])
                  }
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Add Play Type Filter
                </Button>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Filter Statistics</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Total Active Filters: {activeFilters.length}</div>
                <div>
                  Unique Fields:{" "}
                  {new Set(activeFilters.map((f) => f.field)).size}
                </div>
                <div>Estimated Results: {mockFilteredResults}</div>
                <div>Filter Reduction: ~{activeFilters.length * 8} plays</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj<typeof AdvancedFilters> = {
  render: (args) => <AdvancedFiltersDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Default AdvancedFilters component with no active filters.",
      },
    },
  },
};

export const WithActiveFilters: StoryObj<typeof AdvancedFilters> = {
  render: (args) => {
    const [activeFilters, setActiveFilters] = React.useState([
      {
        id: "1",
        field: "formation",
        operator: "equals" as const,
        value: "Shotgun",
        label: 'Formation equals "Shotgun"',
      },
      {
        id: "2",
        field: "playType",
        operator: "equals" as const,
        value: "Pass",
        label: 'Play Type equals "Pass"',
      },
      {
        id: "3",
        field: "successRate",
        operator: "equals" as const,
        value: "75",
        label: 'Success Rate equals "75"',
      },
    ] as any[]);

    const handleFiltersChange = (filters: any[]) => {
      setActiveFilters(filters);
    };

    return (
      <Card className="w-full max-w-4xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              AdvancedFilters with Active Filters
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Component showing multiple active filters with removal options.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <AdvancedFilters
              {...args}
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          <div className="text-sm text-gray-600">
            <strong>Active Filters:</strong> {activeFilters.length}
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "AdvancedFilters component with multiple active filters displayed.",
      },
    },
  },
};
export const AddingFilters: StoryObj<typeof AdvancedFilters> = {
  render: (args) => {
    const [activeFilters, setActiveFilters] = React.useState<any[]>([]);

    return (
      <Card className="w-full max-w-4xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              AdvancedFilters - Adding Filters
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Interactive demo showing how to add new filters to the component.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <AdvancedFilters
              {...args}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
          </div>

          <div className="text-sm text-gray-600">
            <div>
              <strong>Instructions:</strong>
            </div>
            <div>1. Click the "+" button to add a filter</div>
            <div>2. Select a field from the dropdown</div>
            <div>3. Enter or select a value</div>
            <div>4. Click "Add" to apply the filter</div>
            <div>5. Active filters appear as removable tags</div>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing the process of adding filters.",
      },
    },
  },
};
