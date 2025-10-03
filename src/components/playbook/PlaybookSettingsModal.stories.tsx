import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlaybookSettingsModal } from "./PlaybookSettingsModal";
import { useState } from "react";
import { Button } from "../ui/Button/Button";

const meta: Meta<typeof PlaybookSettingsModal> = {
  title: "Playbook/PlaybookSettingsModal",
  component: PlaybookSettingsModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive settings modal for playbook configuration, including personnel settings, bulk operations preferences, and display options. Supports multiple personnel configurations and advanced playbook customization.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
    },
    onClose: {
      action: "closed",
      description: "Callback when modal is closed",
    },
    settings: {
      control: "object",
      description: "Current playbook settings object",
    },
    onSave: {
      action: "settingsSaved",
      description: "Callback when settings are saved",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlaybookSettingsModal>;

const ModalWrapper: React.FC<{
  children: (props: any) => React.ReactElement;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultSettings = {
    personnelGrouping: "11 Personnel",
    personnelNaming: "Standard",
    defaultPersonnel: "11 Personnel",
    defaultFormation: "Shotgun",
    enableAutoTagging: true,
    showComplexity: true,
    theme: "auto" as const,
    gridDensity: "comfortable" as const,
    personnelConfigurations: [
      {
        id: "default",
        name: "11 Personnel",
        isDefault: true,
        players: [
          { id: "qb", category: "QB", customName: "QB", count: 1 },
          { id: "ol1", category: "OL", customName: "LT", count: 1 },
          { id: "ol2", category: "OL", customName: "LG", count: 1 },
          { id: "ol3", category: "OL", customName: "C", count: 1 },
          { id: "ol4", category: "OL", customName: "RG", count: 1 },
          { id: "ol5", category: "OL", customName: "RT", count: 1 },
          { id: "rb1", category: "RB", customName: "RB1", count: 1 },
          { id: "te1", category: "TE", customName: "TE", count: 1 },
          { id: "wr1", category: "WR", customName: "WR1", count: 1 },
          { id: "wr2", category: "WR", customName: "WR2", count: 1 },
          { id: "wr3", category: "WR", customName: "WR3", count: 1 },
        ],
      },
    ],
    positionNames: {
      QB: "QB",
      RB1: "RB1",
      RB2: "RB2",
      WR1: "WR1",
      WR2: "WR2",
      WR3: "WR3",
      TE1: "TE",
      TE2: "TE2",
      OL1: "LT",
      OL2: "LG",
      OL3: "C",
      OL4: "RG",
      OL5: "RT",
    },
    bulkOperations: {
      enableBulkFormationAdd: true,
      enableBulkPlayAdd: true,
      defaultBulkFormationCount: 5,
      defaultBulkPlayCount: 10,
    },
  };

  const handleSave = (settings: any) => {
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Settings</Button>
      {children({
        isOpen,
        onClose: () => setIsOpen(false),
        settings: defaultSettings,
        onSave: handleSave,
      })}
    </div>
  );
};

export const DefaultSettings: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => <PlaybookSettingsModal {...props} />}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Playbook settings modal with default configuration showing personnel, bulk operations, and display tabs.",
      },
    },
  },
};

export const CustomSettings: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => {
        const customSettings = {
          ...props.settings,
          theme: "dark" as const,
          gridDensity: "compact" as const,
          enableAutoTagging: false,
          showComplexity: false,
          bulkOperations: {
            ...props.settings.bulkOperations,
            defaultBulkFormationCount: 3,
            defaultBulkPlayCount: 5,
          },
        };

        return <PlaybookSettingsModal {...props} settings={customSettings} />;
      }}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Settings modal with customized preferences (dark theme, compact grid, reduced bulk operation defaults).",
      },
    },
  },
};

export const SettingsOverview: Story = {
  render: () => (
    <div className="p-6 max-w-4xl">
      <h3 className="text-xl font-bold mb-4">Playbook Settings Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-600">Personnel Tab</h4>
          <ul className="text-sm space-y-1">
            <li>• Personnel configurations</li>
            <li>• Position naming</li>
            <li>• Default formations</li>
            <li>• Auto-tagging settings</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-green-600">Bulk Operations Tab</h4>
          <ul className="text-sm space-y-1">
            <li>• Bulk formation creation</li>
            <li>• Bulk play addition</li>
            <li>• Default counts</li>
            <li>• Operation preferences</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-purple-600">Display Tab</h4>
          <ul className="text-sm space-y-1">
            <li>• Theme selection</li>
            <li>• Grid density</li>
            <li>• Complexity display</li>
            <li>• Visual preferences</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Key Features:</h4>
        <ul className="text-sm space-y-1">
          <li>
            • <strong>Multiple Personnel Configurations:</strong> Support for
            different offensive personnel groupings
          </li>
          <li>
            • <strong>Custom Position Names:</strong> Rename positions for
            team-specific terminology
          </li>
          <li>
            • <strong>Bulk Operation Controls:</strong> Configure default
            behavior for mass operations
          </li>
          <li>
            • <strong>Display Customization:</strong> Theme and layout
            preferences
          </li>
          <li>
            • <strong>Auto-tagging:</strong> Automatic categorization of plays
          </li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive overview of all settings categories and features available in the modal.",
      },
    },
  },
};
