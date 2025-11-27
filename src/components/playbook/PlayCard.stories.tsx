import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { PlayCard } from "./PlayCard";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const meta: Meta<typeof PlayCard> = {
  title: "Features/Playbook/PlayCard",
  component: PlayCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Core playbook component for displaying and editing individual plays.

**Features:**
- Inline editing of play properties
- Drag-and-drop field reordering
- Formation and play details management
- Bulk selection support
- Optimistic updates for smooth UX
- Customizable field visibility

**Usage:**
\`\`\`tsx
import { PlayCard } from './components/playbook/PlayCard';

function PlaybookGrid({ plays, onSave }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plays.map((play) => (
        <PlayCard
          key={play.id}
          play={play}
          onSave={onSave}
          density="comfortable"
        />
      ))}
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    density: {
      control: { type: "select" },
      options: ["compact", "comfortable"],
      description: "Card density/layout mode",
    },
    showOneWordCalls: {
      control: "boolean",
      description: "Show one-word play calls",
    },
    isSelected: {
      control: "boolean",
      description: "Whether the card is selected for bulk operations",
    },
  },
};

export default meta;

// Sample play data
const samplePlay = {
  id: "play-1",
  playbook_id: "pb-1",
  formation: "Shotgun",
  play_name: "Slant/Curl/Crossing",
  p_type: "Pass",
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
};

// PlayCard Demo Component
const PlayCardDemo = (args: any) => {
  const [play, setPlay] = React.useState(samplePlay);
  const [selectedPlays, setSelectedPlays] = React.useState<Set<string>>(
    new Set()
  );

  const handleSave = async (
    _playId: string,
    updates: Partial<typeof samplePlay>
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPlay((prev) => ({ ...prev, ...updates }));
    console.log("Saved play updates:", updates);
  };

  const handleSelectionChange = (playId: string, selected: boolean) => {
    setSelectedPlays((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(playId);
      } else {
        newSet.delete(playId);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">PlayCard Component</h3>
          <p className="text-sm text-secondary mb-4">
            Interactive play card with inline editing, field management, and
            bulk operations.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSelectedPlays(new Set([play.id]))}
              variant="outline"
              size="sm"
            >
              Select Card
            </Button>
            <Button
              onClick={() => setSelectedPlays(new Set())}
              variant="outline"
              size="sm"
            >
              Deselect All
            </Button>
            <Badge variant="info">Selected: {selectedPlays.size}</Badge>
          </div>
        </div>

        {/* PlayCard */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <PlayCard
            {...args}
            play={play}
            onSave={handleSave}
            onEdit={() => console.log("Edit play")}
            onDuplicate={() => console.log("Duplicate play")}
            onCreateDiagram={() => console.log("Create diagram")}
            onAddToPracticeScript={() => console.log("Add to practice script")}
            onAddToGamePlan={() => console.log("Add to game plan")}
            isSelected={selectedPlays.has(play.id)}
            onSelectionChange={handleSelectionChange}
            formationSuggestions={[
              "Shotgun",
              "Pistol",
              "Wildcat",
              "Empty",
              "Trips Right",
              "Bunch Left",
            ]}
            playNameSuggestions={[
              "Slant/Curl",
              "Deep Cross",
              "Flood Concept",
              "Smash Route",
            ]}
          />
        </div>

        {/* Current Play Data */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Play Data</h4>
          <div className="p-4 border rounded-lg bg-gray-50">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(play, null, 2)}
            </pre>
          </div>
        </div>

        {/* Component Features */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Formation Fields</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Formation (Shotgun, Pistol, etc.)</div>
                <div>• Formation Type (Spread, Tight, etc.)</div>
                <div>• Formation Direction (Balanced, Right, Left)</div>
                <div>• Back Alignment (Under Center, etc.)</div>
                <div>• Shift (Yes/No)</div>
                <div>• Motion (Orbit, Jet, etc.)</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Play Details Fields</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Play Name (descriptive name)</div>
                <div>• Play Direction (Right, Left, Middle)</div>
                <div>• Play Type (Pass, Run, RPO)</div>
                <div>• Protection (5-man, 6-man, etc.)</div>
                <div>• One Word Play (quick call)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Props</h4>
          <div className="text-sm space-y-2 text-secondary">
            <div>
              <code>play: PlayType</code> - The play data object
            </div>
            <div>
              <code>showOneWordCalls?: boolean</code> - Show one-word play calls
            </div>
            <div>
              <code>onEdit?: (play) =&gt; void</code> - Edit handler
            </div>
            <div>
              <code>onSave?: (playId, updates) =&gt; Promise&lt;void&gt;</code>{" "}
              - Save handler
            </div>
            <div>
              <code>onDuplicate?: (play) =&gt; void</code> - Duplicate handler
            </div>
            <div>
              <code>onCreateDiagram?: (play) =&gt; void</code> - Diagram
              creation handler
            </div>
            <div>
              <code>isSelected?: boolean</code> - Bulk selection state
            </div>
            <div>
              <code>onSelectionChange?: (playId, selected) =&gt; void</code> -
              Selection change handler
            </div>
            <div>
              <code>density?: "compact" | "comfortable"</code> - Card layout
              density
            </div>
            <div>
              <code>formationSuggestions?: string[]</code> - Formation
              autocomplete suggestions
            </div>
            <div>
              <code>playNameSuggestions?: string[]</code> - Play name
              autocomplete suggestions
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage Examples</h4>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Basic Display</h5>
              <pre className="text-xs bg-muted p-2 rounded">
                {`<PlayCard
  play={play}
  density="compact"
/>`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">With Editing</h5>
              <pre className="text-xs bg-muted p-2 rounded">
                {`<PlayCard
  play={play}
  onSave={handleSave}
  onEdit={handleEdit}
  density="comfortable"
/>`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Bulk Selection</h5>
              <pre className="text-xs bg-muted p-2 rounded">
                {`<PlayCard
  play={play}
  isSelected={selectedPlays.has(play.id)}
  onSelectionChange={handleSelectionChange}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj<typeof PlayCard> = {
  render: (args) => <PlayCardDemo {...args} />,
  args: {
    density: "compact",
    showOneWordCalls: false,
    isSelected: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Default PlayCard with basic functionality and inline editing.",
      },
    },
  },
};

export const ComfortableDensity: StoryObj<typeof PlayCard> = {
  render: (args) => <PlayCardDemo {...args} />,
  args: {
    density: "comfortable",
    showOneWordCalls: true,
    isSelected: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "PlayCard in comfortable density mode with more spacing and one-word calls shown.",
      },
    },
  },
};

export const SelectedState: StoryObj<typeof PlayCard> = {
  render: (args) => <PlayCardDemo {...args} />,
  args: {
    density: "compact",
    showOneWordCalls: false,
    isSelected: true,
  },
  parameters: {
    docs: {
      description: {
        story: "PlayCard in selected state for bulk operations.",
      },
    },
  },
};

export const WithSuggestions: StoryObj<typeof PlayCard> = {
  render: (args) => <PlayCardDemo {...args} />,
  args: {
    density: "comfortable",
    showOneWordCalls: false,
    isSelected: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "PlayCard with formation and play name suggestions for better UX.",
      },
    },
  },
};
