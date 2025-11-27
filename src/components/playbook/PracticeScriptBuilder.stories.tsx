import type { Meta, StoryObj } from "@storybook/react-vite";
import { PracticeScriptBuilder } from "./PracticeScriptBuilder";
import { useState } from "react";
import { Button } from "../ui/Button/Button";

const meta: Meta<typeof PracticeScriptBuilder> = {
  title: "Playbook/PracticeScriptBuilder",
  component: PracticeScriptBuilder,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive practice script builder with drag-and-drop functionality for creating and organizing football practice sessions. Supports adding plays, setting repetitions, estimating time, and exporting to PDF.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    script: {
      control: "object",
      description: "Existing practice script to edit",
    },
    teamId: {
      control: "text",
      description: "ID of the team this script belongs to",
    },
    onSave: {
      action: "scriptSaved",
      description: "Callback when script is saved",
    },
    onCancel: {
      action: "cancelled",
      description: "Callback when operation is cancelled",
    },
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PracticeScriptBuilder>;

const ModalWrapper: React.FC<{
  children: (props: any) => React.ReactElement;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sampleScript = {
    id: "script-123",
    name: "Week 1 Practice",
    description: "Basic offensive fundamentals and new play installation",
    teamId: "team-456",
    plays: [
      {
        id: "play-1",
        play_name: "Power Read",
        formation: "Shotgun",
        p_type: "Run",
        repetitions: 8,
        estimatedTime: 4,
        notes: "Focus on reading the DE",
      },
      {
        id: "play-2",
        play_name: "Slant Route",
        formation: "Shotgun",
        p_type: "Pass",
        repetitions: 6,
        estimatedTime: 3,
        notes: "Work on timing with QB",
      },
      {
        id: "play-3",
        play_name: "Zone Blitz",
        formation: "Shotgun",
        p_type: "Run",
        repetitions: 4,
        estimatedTime: 2,
        notes: "Defensive pressure drill",
      },
    ],
    duration: 9,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  };

  const handleSave = (script: any) => {
    console.log("Saving script:", script);
    alert(`Script "${script.name}" saved successfully!`);
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log("Operation cancelled");
    setIsOpen(false);
  };

  return (
    <div>
      <div className="space-x-4">
        <Button onClick={() => setIsOpen(true)}>Create New Script</Button>
        <Button
          variant="secondary"
          onClick={() => {
            // Set up existing script for editing
            setIsOpen(true);
          }}
        >
          Edit Existing Script
        </Button>
      </div>
      {children({
        isOpen,
        onClose: () => setIsOpen(false),
        teamId: "team-456",
        onSave: handleSave,
        onCancel: handleCancel,
        script: sampleScript,
      })}
    </div>
  );
};

export const CreateNewScript: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => <PracticeScriptBuilder {...props} script={undefined} />}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modal for creating a new practice script from scratch.",
      },
    },
  },
};

export const EditExistingScript: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => <PracticeScriptBuilder {...props} />}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Modal for editing an existing practice script with pre-loaded plays.",
      },
    },
  },
};

export const FeaturesOverview: Story = {
  render: () => (
    <div className="p-6 max-w-4xl">
      <h3 className="text-xl font-bold mb-6">
        Practice Script Builder Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-600">Core Functionality</h4>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Script Creation:</strong> Create named practice scripts
              with descriptions
            </li>
            <li>
              <strong>Play Addition:</strong> Add plays from playbook with play
              selector modal
            </li>
            <li>
              <strong>Drag & Drop:</strong> Reorder plays within the script
            </li>
            <li>
              <strong>Repetition Settings:</strong> Configure how many times to
              run each play
            </li>
            <li>
              <strong>Time Estimation:</strong> Track estimated duration for
              each segment
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-green-600">Advanced Features</h4>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Play Notes:</strong> Add specific coaching notes for each
              play
            </li>
            <li>
              <strong>Duration Tracking:</strong> Automatic calculation of total
              script time
            </li>
            <li>
              <strong>PDF Export:</strong> Generate printable practice scripts
            </li>
            <li>
              <strong>Play Removal:</strong> Remove plays that don't fit the
              session
            </li>
            <li>
              <strong>Script Editing:</strong> Modify script name and
              description
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-secondary rounded-lg">
        <h4 className="font-medium mb-3">Typical Workflow:</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Create new script or edit existing one</li>
          <li>Add plays from playbook using the play selector</li>
          <li>Set repetitions and time estimates for each play</li>
          <li>Reorder plays by dragging and dropping</li>
          <li>Add coaching notes for specific plays</li>
          <li>Save script and optionally export to PDF</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-status-info-bg rounded-lg">
        <h4 className="font-medium mb-2">Integration Points:</h4>
        <ul className="text-sm space-y-1">
          <li>
            <strong>Playbook:</strong> Sources plays from team's playbook
          </li>
          <li>
            <strong>Team Management:</strong> Associates scripts with specific
            teams
          </li>
          <li>
            <strong>PDF Export:</strong> Generates formatted practice documents
          </li>
          <li>
            <strong>Toast Notifications:</strong> Provides user feedback for
            operations
          </li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive overview of all features and capabilities of the practice script builder.",
      },
    },
  },
};
