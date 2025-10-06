import type { Meta, StoryObj } from "@storybook/react-vite";
import { BulkActionsToolbar } from "./BulkActionsToolbar";

const meta: Meta<typeof BulkActionsToolbar> = {
  title: "Playbook/BulkActionsToolbar",
  component: BulkActionsToolbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A floating toolbar that appears when multiple plays are selected, providing bulk operations like tagging, duplicating, adding to practice scripts, editing, exporting, and deleting plays.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selectedCount: {
      control: { type: "number", min: 0, max: 100 },
      description: "Number of currently selected plays",
    },
    onClearSelection: {
      action: "selectionCleared",
      description: "Callback when clear selection button is clicked",
    },
    onBulkAction: {
      action: "bulkAction",
      description: "Callback when a bulk action button is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkActionsToolbar>;

export const SinglePlaySelected: Story = {
  args: {
    selectedCount: 1,
    onClearSelection: () => console.log("Clear selection"),
    onBulkAction: (action) => console.log(`Bulk action: ${action}`),
  },
  parameters: {
    docs: {
      description: {
        story: "Toolbar shown when a single play is selected.",
      },
    },
  },
};

export const MultiplePlaysSelected: Story = {
  args: {
    selectedCount: 5,
    onClearSelection: () => console.log("Clear selection"),
    onBulkAction: (action) => console.log(`Bulk action: ${action}`),
  },
  parameters: {
    docs: {
      description: {
        story: "Toolbar shown when multiple plays are selected.",
      },
    },
  },
};

export const ManyPlaysSelected: Story = {
  args: {
    selectedCount: 25,
    onClearSelection: () => console.log("Clear selection"),
    onBulkAction: (action) => console.log(`Bulk action: ${action}`),
  },
  parameters: {
    docs: {
      description: {
        story: "Toolbar shown when many plays are selected.",
      },
    },
  },
};

export const NoSelection: Story = {
  args: {
    selectedCount: 0,
    onClearSelection: () => console.log("Clear selection"),
    onBulkAction: (action) => console.log(`Bulk action: ${action}`),
  },
  parameters: {
    docs: {
      description: {
        story: "Toolbar is hidden when no plays are selected (default state).",
      },
    },
  },
};

export const AvailableActions: Story = {
  render: () => (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Available Bulk Actions:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-green-600">Primary Actions:</h4>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Add to Practice:</strong> Add selected plays to practice
              script
            </li>
            <li>
              <strong>Delete:</strong> Permanently remove selected plays
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">Secondary Actions:</h4>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Tag:</strong> Add tags to organize plays
            </li>
            <li>
              <strong>Duplicate:</strong> Create copies of selected plays
            </li>
            <li>
              <strong>Edit:</strong> Batch edit play properties
            </li>
            <li>
              <strong>Export:</strong> Download plays as file
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-surface-secondary rounded-lg">
        <h4 className="font-medium mb-2">Usage Context:</h4>
        <p className="text-sm text-gray-600">
          This toolbar appears as a floating element at the bottom of the screen
          when users select multiple plays in the playbook grid. It provides
          quick access to common bulk operations without cluttering the main
          interface.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Documentation of all available bulk actions and their purposes.",
      },
    },
  },
};
