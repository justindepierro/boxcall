import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import TextArea from "./TextArea";

const meta: Meta<typeof TextArea> = {
  title: "UI/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive textarea component with auto-resize, character counting, validation states, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    status: {
      control: { type: "select" },
      options: ["default", "error", "success", "warning"],
    },
    disabled: {
      control: "boolean",
    },
    required: {
      control: "boolean",
    },
    autoResize: {
      control: "boolean",
    },
    showCharacterCount: {
      control: "boolean",
    },
    fullWidth: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
    label: "Message",
    rows: 4,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Description",
    placeholder: "Describe your project...",
    helperText:
      "Provide a detailed description of your project goals and requirements.",
    rows: 4,
  },
};

export const CharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <TextArea
        label="Bio"
        placeholder="Tell us about yourself..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={200}
        showCharacterCount={true}
        rows={4}
        helperText="Maximum 200 characters"
      />
    );
  },
};

export const AutoResize: Story = {
  render: () => {
    const [value, setValue] = useState(
      "This textarea will automatically resize as you type more content.\n\nTry adding more lines to see it grow!"
    );

    return (
      <TextArea
        label="Auto-resizing TextArea"
        placeholder="Start typing to see auto-resize..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoResize={true}
        rows={3}
      />
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const [errorValue, setErrorValue] = useState("");
    const [successValue, setSuccessValue] = useState(
      "This is a valid comment."
    );
    const [warningValue, setWarningValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <TextArea
          label="Required Field"
          placeholder="This field is required"
          value={errorValue}
          onChange={(e) => setErrorValue(e.target.value)}
          status="error"
          errorMessage="This field cannot be empty"
          required
          rows={3}
        />

        <TextArea
          label="Valid Input"
          placeholder="Enter valid content"
          value={successValue}
          onChange={(e) => setSuccessValue(e.target.value)}
          status="success"
          successMessage="Looks good!"
          rows={3}
        />

        <TextArea
          label="Optional Field"
          placeholder="Optional content"
          value={warningValue}
          onChange={(e) => setWarningValue(e.target.value)}
          status="warning"
          warningMessage="Consider adding more details"
          rows={3}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smValue, setSmValue] = useState("");
    const [mdValue, setMdValue] = useState("");
    const [lgValue, setLgValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <TextArea
          size="sm"
          label="Small TextArea"
          placeholder="Small size"
          value={smValue}
          onChange={(e) => setSmValue(e.target.value)}
          rows={2}
        />

        <TextArea
          size="md"
          label="Medium TextArea"
          placeholder="Medium size (default)"
          value={mdValue}
          onChange={(e) => setMdValue(e.target.value)}
          rows={4}
        />

        <TextArea
          size="lg"
          label="Large TextArea"
          placeholder="Large size"
          value={lgValue}
          onChange={(e) => setLgValue(e.target.value)}
          rows={6}
        />
      </div>
    );
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Width TextArea",
    placeholder: "This textarea spans the full width of its container",
    fullWidth: true,
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled TextArea",
    placeholder: "This textarea is disabled",
    disabled: true,
    value: "This content cannot be edited",
    rows: 3,
  },
};

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = useState(
      "This is some initial text that demonstrates the max length feature."
    );

    return (
      <TextArea
        label="Limited TextArea"
        placeholder="Enter text with a limit..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={100}
        showCharacterCount={true}
        rows={4}
        helperText="Maximum 100 characters allowed"
      />
    );
  },
};
