import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button/Button";
import { Typography } from "../../design-system/Typography";
import { Input } from "../Input";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible modal component with multiple sizes, types, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "fullscreen"],
    },
    type: {
      control: { type: "select" },
      options: ["default", "alert", "confirm"],
    },
    closeOnBackdropClick: {
      control: "boolean",
    },
    closeOnEscape: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Default Modal",
    children: (
      <Typography variant="body-md">
        This is a default modal with standard content. You can put any content
        here.
      </Typography>
    ),
  },
};

export const Sizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpenModal("sm")}>Small Modal</Button>
        <Button onClick={() => setOpenModal("md")}>Medium Modal</Button>
        <Button onClick={() => setOpenModal("lg")}>Large Modal</Button>
        <Button onClick={() => setOpenModal("xl")}>Extra Large Modal</Button>
        <Button onClick={() => setOpenModal("fullscreen")}>
          Fullscreen Modal
        </Button>

        <Modal
          isOpen={openModal === "sm"}
          onClose={() => setOpenModal(null)}
          title="Small Modal"
          size="sm"
        >
          <Typography variant="body-md">This is a small modal.</Typography>
        </Modal>

        <Modal
          isOpen={openModal === "md"}
          onClose={() => setOpenModal(null)}
          title="Medium Modal"
          size="md"
        >
          <Typography variant="body-md">
            This is a medium modal with more content space.
          </Typography>
        </Modal>

        <Modal
          isOpen={openModal === "lg"}
          onClose={() => setOpenModal(null)}
          title="Large Modal"
          size="lg"
        >
          <Typography variant="body-md">
            This is a large modal perfect for forms or detailed content that
            needs more space.
          </Typography>
        </Modal>

        <Modal
          isOpen={openModal === "xl"}
          onClose={() => setOpenModal(null)}
          title="Extra Large Modal"
          size="xl"
        >
          <Typography variant="body-md">
            This extra large modal provides maximum space for complex interfaces
            or data-rich content.
          </Typography>
        </Modal>

        <Modal
          isOpen={openModal === "fullscreen"}
          onClose={() => setOpenModal(null)}
          title="Fullscreen Modal"
          size="fullscreen"
        >
          <Typography variant="body-md">
            This fullscreen modal takes up the entire viewport, perfect for
            immersive experiences or complex workflows.
          </Typography>
        </Modal>
      </div>
    );
  },
};

export const WithFooter: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Modal with Footer",
    children: (
      <div className="space-y-4">
        <Typography variant="body-md">
          This modal includes a footer with action buttons.
        </Typography>
        <Typography variant="body-sm" className="text-muted">
          Use the footer prop to add action buttons or other controls.
        </Typography>
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </div>
    ),
  },
};

export const AlertModal: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Delete Player",
    type: "alert",
    children: (
      <div className="space-y-4">
        <Typography variant="body-md">
          Are you sure you want to delete this player? This action cannot be
          undone.
        </Typography>
        <Typography variant="body-sm" className="text-muted">
          This will permanently remove the player from your roster and all
          associated data.
        </Typography>
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="danger">Delete Player</Button>
      </div>
    ),
  },
};

export const ConfirmModal: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Confirm Action",
    type: "confirm",
    children: (
      <Typography variant="body-md">
        Do you want to proceed with this action? Please confirm your choice.
      </Typography>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </div>
    ),
  },
};

export const FormModal: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Add New Player",
    size: "lg",
    children: (
      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter player's full name"
          required
        />
        <Input
          label="Jersey Number"
          type="number"
          placeholder="00"
          min={0}
          max={99}
        />
        <Input label="Position" placeholder="QB, RB, WR, etc." />
        <Input label="Email" type="email" placeholder="player@school.edu" />
        <Input label="Phone" type="tel" placeholder="(555) 123-4567" />
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Add Player</Button>
      </div>
    ),
  },
};

export const CustomHeader: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    headerContent: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          JD
        </div>
        <div>
          <Typography variant="headline-sm">John Doe</Typography>
          <Typography variant="caption">Player Profile</Typography>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-4">
        <Typography variant="body-md">
          Custom header content allows for more complex header layouts with
          avatars, badges, or other elements.
        </Typography>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="label-md">Position</Typography>
            <Typography variant="body-sm">Quarterback</Typography>
          </div>
          <div>
            <Typography variant="label-md">Jersey</Typography>
            <Typography variant="body-sm">#12</Typography>
          </div>
        </div>
      </div>
    ),
  },
};

export const ScrollableContent: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: "Scrollable Content",
    size: "md",
    children: (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <Typography variant="body-md">
          This modal contains scrollable content. When content exceeds the modal
          height, it becomes scrollable while the header and footer remain
          fixed.
        </Typography>

        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="p-3 bg-secondary rounded">
            <Typography variant="body-sm">Content block {i + 1}</Typography>
            <Typography variant="caption">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </div>
        ))}
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline">Close</Button>
      </div>
    ),
  },
};
