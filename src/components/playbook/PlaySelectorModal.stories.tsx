import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { PlaySelectorModal } from "./PlaySelectorModal";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const meta: Meta<typeof PlaySelectorModal> = {
  title: "Features/Playbook/PlaySelectorModal",
  component: PlaySelectorModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Modal component for selecting plays to add to practice scripts, game plans, or other contexts.

**Features:**
- Search plays by name, formation, or notes
- Filter by formation and play type
- Exclude already selected plays
- Display success rates and play statistics
- Loading states and empty state handling
- Responsive modal interface

**Usage:**
\`\`\`tsx
import { PlaySelectorModal } from './components/playbook/PlaySelectorModal';

function PracticeScriptBuilder() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlays, setSelectedPlays] = useState([]);

  const handleSelectPlay = (play) => {
    setSelectedPlays([...selectedPlays, play]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Add Play to Script
      </Button>

      <PlaySelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPlay={handleSelectPlay}
        selectedPlayIds={selectedPlays.map(p => p.id)}
      />
    </>
  );
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether the modal is open",
    },
    teamId: {
      control: "text",
      description: "Team ID for filtering plays",
    },
  },
};

export default meta;

// PlaySelectorModal Demo Component
const PlaySelectorModalDemo = (args: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedPlays, setSelectedPlays] = React.useState<any[]>([]);
  const [lastSelectedPlay, setLastSelectedPlay] = React.useState<any>(null);

  const handleSelectPlay = (play: any) => {
    setSelectedPlays([...selectedPlays, play]);
    setLastSelectedPlay(play);
    setIsOpen(false);
  };

  const handleRemovePlay = (playId: string) => {
    setSelectedPlays(selectedPlays.filter((p) => p.id !== playId));
  };

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            PlaySelectorModal Component
          </h3>
          <p className="text-sm text-secondary mb-4">
            Modal for selecting plays to add to practice scripts or game plans
            with search and filtering.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsOpen(true)} variant="primary">
              Open Play Selector
            </Button>
            <Button
              onClick={() => setSelectedPlays([])}
              variant="outline"
              size="sm"
            >
              Clear Selected Plays
            </Button>
            <Badge variant="info">Selected: {selectedPlays.length}</Badge>
          </div>
        </div>

        {/* Last Selected Play */}
        {lastSelectedPlay && (
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="font-medium text-green-800 mb-2">
              Last Selected Play
            </h4>
            <div className="text-sm text-green-700">
              <div>
                <strong>{lastSelectedPlay.formation}</strong> -{" "}
                {lastSelectedPlay.play_name}
              </div>
              <div className="mt-1">
                Type: {lastSelectedPlay.p_type} | Success Rate:{" "}
                {Math.round(
                  (lastSelectedPlay.times_successful /
                    lastSelectedPlay.times_called) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        )}

        {/* Selected Plays List */}
        {selectedPlays.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Selected Plays</h4>
            <div className="space-y-2">
              {selectedPlays.map((play) => (
                <div
                  key={play.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {play.formation} - {play.play_name}
                    </div>
                    <div className="text-sm text-secondary">
                      {play.p_type} • {play.times_called} calls •{" "}
                      {Math.round(
                        (play.times_successful / play.times_called) * 100
                      )}
                      % success
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemovePlay(play.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        <PlaySelectorModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelectPlay={handleSelectPlay}
          selectedPlayIds={selectedPlays.map((p) => p.id)}
        />

        {/* Component Features */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Search & Filtering</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Search by play name, formation, or notes</div>
                <div>• Filter by formation (Shotgun, Pistol, etc.)</div>
                <div>• Filter by play type (Pass, Run, RPO)</div>
                <div>• Excludes already selected plays</div>
                <div>• Real-time filtering as you type</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Play Information</h5>
              <div className="text-sm text-secondary space-y-1">
                <div>• Formation and directional information</div>
                <div>• Success rate based on historical data</div>
                <div>• Play type and personnel badges</div>
                <div>• Notes and additional context</div>
                <div>• Confidence score display</div>
              </div>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="space-y-4">
          <h4 className="font-medium">Component Props</h4>
          <div className="text-sm space-y-2 text-secondary">
            <div>
              <code>isOpen: boolean</code> - Whether the modal is visible
            </div>
            <div>
              <code>onClose: () =&gt; void</code> - Handler for closing the
              modal
            </div>
            <div>
              <code>onSelectPlay: (play) =&gt; void</code> - Handler when a play
              is selected
            </div>
            <div>
              <code>teamId?: string</code> - Team ID for filtering plays
            </div>
            <div>
              <code>selectedPlayIds?: string[]</code> - IDs of already selected
              plays to exclude
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage Examples</h4>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Basic Usage</h5>
              <pre className="text-xs bg-surface-muted p-2 rounded">
                {`<PlaySelectorModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSelectPlay={handleSelectPlay}
/>`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">
                With Selected Plays Exclusion
              </h5>
              <pre className="text-xs bg-surface-muted p-2 rounded">
                {`<PlaySelectorModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSelectPlay={handleSelectPlay}
  selectedPlayIds={selectedPlays.map(p => p.id)}
/>`}
              </pre>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">
                In Practice Script Builder
              </h5>
              <pre className="text-xs bg-surface-muted p-2 rounded">
                {`function PracticeScriptBuilder() {
  const [selectedPlays, setSelectedPlays] = useState([]);

  return (
    <PlaySelectorModal
      isOpen={showSelector}
      onClose={() => setShowSelector(false)}
      onSelectPlay={(play) => {
        setSelectedPlays([...selectedPlays, play]);
        setShowSelector(false);
      }}
      selectedPlayIds={selectedPlays.map(p => p.id)}
    />
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj<typeof PlaySelectorModal> = {
  render: (args) => <PlaySelectorModalDemo {...args} />,
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default PlaySelectorModal with search and filtering capabilities.",
      },
    },
  },
};

export const WithPreSelectedPlays: StoryObj<typeof PlaySelectorModal> = {
  render: (args) => {
    return (
      <PlaySelectorModalDemo {...args} selectedPlayIds={["play-1", "play-2"]} />
    );
  },
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "PlaySelectorModal that excludes already selected plays from the list.",
      },
    },
  },
};

export const EmptyState: StoryObj<typeof PlaySelectorModal> = {
  render: (args) => {
    // Mock empty state by overriding the component's data loading
    React.useEffect(() => {
      const originalLoadPlays = (window as any).__loadPlays;
      (window as any).__loadPlays = () => Promise.resolve([]);
      return () => {
        (window as any).__loadPlays = originalLoadPlays;
      };
    }, []);

    return <PlaySelectorModalDemo {...args} />;
  },
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "PlaySelectorModal showing empty state when no plays are available.",
      },
    },
  },
};
