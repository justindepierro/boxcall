import type { Meta, StoryObj } from "@storybook/react";
import { AddNewPlayModal } from "./AddNewPlayModal";
import { useState } from "react";
import { Button } from "../ui/Button/Button";

const meta: Meta<typeof AddNewPlayModal> = {
  title: "Playbook/AddNewPlayModal",
  component: AddNewPlayModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal component for creating new plays or editing existing plays in a football playbook. Supports comprehensive play metadata including formation, play type, personnel, and descriptions.",
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
    onCreatePlay: {
      action: "playCreated",
      description: "Callback when a new play is created",
    },
    existingPlay: {
      control: "object",
      description: "Existing play data for editing mode",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddNewPlayModal>;

const ModalWrapper: React.FC<{
  children: (props: any) => React.ReactElement;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreatePlay = async (playData: any) => {
    console.log("Creating play:", playData);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Play "${playData.play_name}" created successfully!`);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      {children({
        isOpen,
        onClose: () => setIsOpen(false),
        onCreatePlay: handleCreatePlay,
      })}
    </div>
  );
};

export const CreateNewPlay: Story = {
  render: () => (
    <ModalWrapper>{(props) => <AddNewPlayModal {...props} />}</ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modal for creating a new play with all form fields empty.",
      },
    },
  },
};

export const EditExistingPlay: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => (
        <AddNewPlayModal
          {...props}
          existingPlay={{
            id: "play-123",
            play_name: "Power Read",
            formation: "Shotgun",
            p_type: "Run",
            personnel: "11 Personnel",
            notes: "Strong side run with read option to QB keeper",
          }}
        />
      )}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modal for editing an existing play with pre-filled form data.",
      },
    },
  },
};

export const WithMinimalData: Story = {
  render: () => (
    <ModalWrapper>
      {(props) => (
        <AddNewPlayModal
          {...props}
          existingPlay={{
            id: "play-456",
            play_name: "Slant Route",
            formation: "",
            p_type: "",
            personnel: "",
            notes: "",
          }}
        />
      )}
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modal editing a play with only the name filled in.",
      },
    },
  },
};

export const FormationExamples: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Formations:</h3>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        <li>• Empty</li>
        <li>• Shotgun</li>
        <li>• Pistol</li>
        <li>• Wildcat</li>
        <li>• Trips Right</li>
        <li>• Trips Left</li>
        <li>• Bunch Right</li>
        <li>• Bunch Left</li>
        <li>• Stack Right</li>
        <li>• Stack Left</li>
      </ul>

      <h3 className="text-lg font-semibold">Available Play Types:</h3>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        <li>• Pass</li>
        <li>• Run</li>
        <li>• Screen</li>
        <li>• Draw</li>
        <li>• Trick</li>
        <li>• Field Goal</li>
        <li>• Punt</li>
      </ul>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Reference for all available formation and play type options in the dropdowns.",
      },
    },
  },
};
