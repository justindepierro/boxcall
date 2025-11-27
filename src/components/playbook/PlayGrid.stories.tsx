import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { PlayGrid } from "./PlayGrid";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

const meta: Meta<typeof PlayGrid> = {
  title: "Features/Playbook/PlayGrid",
  component: PlayGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Main playbook grid component for displaying and managing collections of plays.

**Features:**
- Virtualized rendering for performance with large playbooks
- Advanced filtering (search, categories, formations, play types)
- Bulk selection and operations
- Loading states and error handling
- One-word vs full play name toggle
- Database integration with refresh capabilities
- Telemetry tracking for usage analytics
- Responsive grid layout

**Usage:**
\`\`\`tsx
import { PlayGrid } from './components/playbook/PlayGrid';

function PlaybookPage({ teamId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedPlays, setSelectedPlays] = useState(new Set());

  return (
    <PlayGrid
      searchQuery={searchQuery}
      filters={filters}
      enableBulkOperations={true}
      selectedPlayIds={selectedPlays}
      onPlaySelectionChange={setSelectedPlays}
      onSave={handleSavePlay}
      onDuplicate={handleDuplicatePlay}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    searchQuery: {
      control: "text",
      description: "Search query to filter plays",
    },
    selectedCategory: {
      control: { type: "select" },
      options: ["", "run", "pass", "rpo", "special"],
      description: "Category filter from Smart Glossary",
    },
    selectedSubcategory: {
      control: { type: "select" },
      options: ["", "inside-zone", "outside-zone", "slant", "out"],
      description: "Subcategory filter within selected category",
    },
    enableBulkOperations: {
      control: "boolean",
      description: "Enable bulk selection and operations",
    },
  },
};

export default meta;

// Sample play data
const samplePlays = [
  {
    id: "play-1",
    playbook_id: "pb-1",
    formation: "Shotgun",
    play_name: "Slant/Curl/Crossing",
    p_type: "Pass" as const,
    personnel: "11",
    protection: "5-man protection",
    p_dir: "Right",
    f_type: "Spread",
    f_dir: "Balanced",
    back_align: "Under Center",
    shift: "No",
    motion: "Orbit Motion Left",
    r_str: "Deep Cross",
    p_str: "Slant/Curl/Cross",
    one_word_play: "Flood",
    confidence_base: 75,
    times_called: 12,
    times_successful: 9,
    created_by: "coach-1",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-20"),
  },
  {
    id: "play-2",
    playbook_id: "pb-1",
    formation: "Pistol",
    play_name: "Inside Zone",
    p_type: "Run" as const,
    personnel: "12",
    protection: "6-man protection",
    p_dir: "Left",
    f_type: "Tight",
    f_dir: "Right",
    back_align: "Under Center",
    shift: "No",
    motion: "No Motion",
    r_str: "Inside Zone",
    p_str: "Inside Zone",
    one_word_play: "Zone",
    confidence_base: 82,
    times_called: 18,
    times_successful: 14,
    created_by: "coach-1",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-18"),
  },
  {
    id: "play-3",
    playbook_id: "pb-1",
    formation: "Wildcat",
    play_name: "RPO Slant/Zone",
    p_type: "RPO" as const,
    personnel: "10",
    protection: "5-man protection",
    p_dir: "Right",
    f_type: "Spread",
    f_dir: "Balanced",
    back_align: "Under Center",
    shift: "Yes",
    motion: "Jet Motion Right",
    r_str: "Zone/Slant",
    p_str: "RPO Slant",
    one_word_play: "RPO",
    confidence_base: 68,
    times_called: 7,
    times_successful: 4,
    created_by: "coach-1",
    created_at: new Date("2024-01-12"),
    updated_at: new Date("2024-01-19"),
  },
];

// PlayGrid Demo Component
const PlayGridDemo = (args: any) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [selectedSubcategory, setSelectedSubcategory] = React.useState("");
  const [selectedPlayIds, setSelectedPlayIds] = React.useState(
    new Set<string>()
  );
  const [playCount, setPlayCount] = React.useState(0);

  const handleSave = async (playId: string, updates: any) => {
    console.log("Saving play:", playId, updates);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleDuplicate = (play: any) => {
    console.log("Duplicating play:", play.id);
  };

  const handleCreateDiagram = (play: any) => {
    console.log("Creating diagram for play:", play.id);
  };

  const handleAddToPracticeScript = (play: any) => {
    console.log("Adding to practice script:", play.id);
  };

  const handleAddToGamePlan = (play: any) => {
    console.log("Adding to game plan:", play.id);
  };

  // Mock the useTeamsData hook behavior
  const mockUseTeamsData = () => ({
    plays: samplePlays,
    loading: false,
    error: null,
    refreshData: () => console.log("Refreshing data"),
  });

  // Override the hook for demo purposes
  React.useEffect(() => {
    const originalHook = (window as any).__useTeamsData;
    (window as any).__useTeamsData = mockUseTeamsData;
    return () => {
      (window as any).__useTeamsData = originalHook;
    };
  }, []);

  return (
    <div className="min-h-screen bg-secondary p-6">
      <Card className="w-full container-page p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">PlayGrid Component</h3>
            <p className="text-sm text-secondary mb-4">
              Virtualized playbook grid with advanced filtering, bulk
              operations, and performance optimizations.
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  placeholder="Search plays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select
                  placeholder="All Categories"
                  options={[
                    { value: "", label: "All Categories" },
                    { value: "run", label: "Run" },
                    { value: "pass", label: "Pass" },
                    { value: "rpo", label: "RPO" },
                    { value: "special", label: "Special Teams" },
                  ]}
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val as string)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subcategory
                </label>
                <Select
                  placeholder="All Subcategories"
                  options={[
                    { value: "", label: "All Subcategories" },
                    ...(selectedCategory === "run"
                      ? [
                          { value: "inside-zone", label: "Inside Zone" },
                          { value: "outside-zone", label: "Outside Zone" },
                          { value: "power", label: "Power" },
                        ]
                      : []),
                    ...(selectedCategory === "pass"
                      ? [
                          { value: "slant", label: "Slant" },
                          { value: "out", label: "Out" },
                          { value: "curl", label: "Curl" },
                        ]
                      : []),
                  ]}
                  value={selectedSubcategory}
                  onChange={(val) => setSelectedSubcategory(val as string)}
                  disabled={!selectedCategory}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <Badge variant="info">Total Plays: {playCount}</Badge>
              <Badge variant="success">Selected: {selectedPlayIds.size}</Badge>
              <Button
                onClick={() => setSelectedPlayIds(new Set())}
                variant="outline"
                size="sm"
                disabled={selectedPlayIds.size === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {/* PlayGrid */}
          <div className="border rounded-lg p-4 bg-white">
            <PlayGrid
              {...args}
              searchQuery={searchQuery}
              filters={{}}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSave={handleSave}
              onDuplicate={handleDuplicate}
              onCreateDiagram={handleCreateDiagram}
              onAddToPracticeScript={handleAddToPracticeScript}
              onAddToGamePlan={handleAddToGamePlan}
              selectedPlayIds={selectedPlayIds}
              onPlaySelectionChange={setSelectedPlayIds}
              onPlayCountChange={setPlayCount}
            />
          </div>

          {/* Component Features */}
          <div className="space-y-4">
            <h4 className="font-medium">Component Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Filtering & Search</h5>
                <div className="text-sm text-secondary space-y-1">
                  <div>• Text search across play names, formations, notes</div>
                  <div>
                    • Category-based filtering (Run, Pass, RPO, Special)
                  </div>
                  <div>• Subcategory filtering within categories</div>
                  <div>• Formation and play type filters</div>
                  <div>• Real-time filtering with telemetry tracking</div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-sm">Performance & UX</h5>
                <div className="text-sm text-secondary space-y-1">
                  <div>• Virtualized rendering for large playbooks</div>
                  <div>• Bulk selection with select-all functionality</div>
                  <div>• One-word vs full play name toggle</div>
                  <div>• Loading states and error handling</div>
                  <div>• Optimistic updates for smooth interactions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Props Documentation */}
          <div className="space-y-4">
            <h4 className="font-medium">Component Props</h4>
            <div className="text-sm space-y-2 text-secondary">
              <div>
                <code>searchQuery: string</code> - Text search query
              </div>
              <div>
                <code>filters: object</code> - Formation, play type, and other
                filters
              </div>
              <div>
                <code>selectedCategory?: string</code> - Category filter from
                Smart Glossary
              </div>
              <div>
                <code>selectedSubcategory?: string</code> - Subcategory within
                category
              </div>
              <div>
                <code>
                  onSave?: (playId, updates) =&gt; Promise&lt;void&gt;
                </code>{" "}
                - Save handler
              </div>
              <div>
                <code>onDuplicate?: (play) =&gt; void</code> - Duplicate handler
              </div>
              <div>
                <code>enableBulkOperations?: boolean</code> - Enable bulk
                selection
              </div>
              <div>
                <code>selectedPlayIds?: Set&lt;string&gt;</code> - Currently
                selected play IDs
              </div>
              <div>
                <code>onPlaySelectionChange?: (playIds) =&gt; void</code> -
                Selection change handler
              </div>
              <div>
                <code>onPlayCountChange?: (count) =&gt; void</code> - Play count
                callback
              </div>
              <div>
                <code>refreshTrigger?: number</code> - Trigger for data refresh
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-4">
            <h4 className="font-medium">Usage Examples</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm mb-2">Basic Grid</h5>
                <pre className="text-xs bg-muted p-2 rounded">
                  {`<PlayGrid
  searchQuery={searchQuery}
  filters={filters}
  onSave={handleSave}
/>`}
                </pre>
              </div>

              <div className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm mb-2">
                  With Bulk Operations
                </h5>
                <pre className="text-xs bg-muted p-2 rounded">
                  {`<PlayGrid
  searchQuery={searchQuery}
  filters={filters}
  enableBulkOperations={true}
  selectedPlayIds={selectedPlays}
  onPlaySelectionChange={setSelectedPlays}
  onSave={handleSave}
/>`}
                </pre>
              </div>

              <div className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm mb-2">
                  With Category Filtering
                </h5>
                <pre className="text-xs bg-muted p-2 rounded">
                  {`<PlayGrid
  searchQuery={searchQuery}
  selectedCategory="run"
  selectedSubcategory="inside-zone"
  onSave={handleSave}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Story definitions
export const Default: StoryObj<typeof PlayGrid> = {
  render: (args) => <PlayGridDemo {...args} />,
  args: {
    enableBulkOperations: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Default PlayGrid with basic functionality and search.",
      },
    },
  },
};

export const WithBulkOperations: StoryObj<typeof PlayGrid> = {
  render: (args) => <PlayGridDemo {...args} />,
  args: {
    enableBulkOperations: true,
  },
  parameters: {
    docs: {
      description: {
        story: "PlayGrid with bulk selection and operations enabled.",
      },
    },
  },
};

export const FilteredByCategory: StoryObj<typeof PlayGrid> = {
  render: (args) => <PlayGridDemo {...args} />,
  args: {
    enableBulkOperations: false,
    selectedCategory: "run",
    selectedSubcategory: "inside-zone",
  },
  parameters: {
    docs: {
      description: {
        story: "PlayGrid filtered by category and subcategory.",
      },
    },
  },
};

export const WithSearch: StoryObj<typeof PlayGrid> = {
  render: (args) => <PlayGridDemo {...args} />,
  args: {
    enableBulkOperations: false,
    searchQuery: "zone",
  },
  parameters: {
    docs: {
      description: {
        story: "PlayGrid with active search query filtering results.",
      },
    },
  },
};
