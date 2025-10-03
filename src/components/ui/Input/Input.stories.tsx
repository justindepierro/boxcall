import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./index";
import { Icon } from "../Icon/Icon";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive input component with multiple variants, sizes, validation states, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    label: "Default Input",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input variant="text" placeholder="Text input" label="Text" />
      <Input variant="email" placeholder="user@example.com" label="Email" />
      <Input variant="password" placeholder="••••••••" label="Password" />
      <Input variant="number" placeholder="123" label="Number" />
      <Input variant="tel" placeholder="(555) 123-4567" label="Phone" />
      <Input variant="url" placeholder="https://example.com" label="URL" />
      <Input variant="search" placeholder="Search..." label="Search" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input size="sm" placeholder="Small input" label="Small" />
      <Input size="md" placeholder="Medium input" label="Medium" />
      <Input size="lg" placeholder="Large input" label="Large" />
    </div>
  ),
};

export const WithLabelsAndHelp: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input
        label="Username"
        placeholder="Enter your username"
        helperText="Choose a unique username"
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        helperText="We'll never share your email"
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input
        label="Valid Input"
        status="success"
        defaultValue="john.doe@example.com"
        successMessage="Email is valid"
      />
      <Input
        label="Invalid Input"
        status="error"
        defaultValue="invalid-email"
        errorMessage="Please enter a valid email address"
      />
      <Input
        label="Warning Input"
        status="warning"
        defaultValue="test@example"
        warningMessage="Consider using a more professional email"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input
        label="Search"
        variant="search"
        placeholder="Search for players..."
        leftIcon={<Icon name="search" size="sm" />}
      />
      <Input
        label="Username"
        placeholder="Enter username"
        leftIcon={<Icon name="user" size="sm" />}
      />
      <Input
        label="Email"
        type="email"
        placeholder="Enter email"
        leftIcon={<Icon name="mail" size="sm" />}
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="Enter phone"
        leftIcon={<Icon name="phone" size="sm" />}
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "This input is disabled",
    disabled: true,
    defaultValue: "Disabled value",
  },
};

export const Required: Story = {
  args: {
    label: "Required Field",
    placeholder: "This field is required",
    required: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Width Input",
    placeholder: "This input spans full width",
    className: "w-full",
  },
  parameters: {
    layout: "padded",
  },
};

export const PasswordToggle: Story = {
  args: {
    variant: "password",
    label: "Password",
    placeholder: "Enter your password",
  },
};

export const NumberInput: Story = {
  args: {
    variant: "number",
    label: "Quantity",
    placeholder: "Enter quantity",
    min: 0,
    max: 100,
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Player Registration</h3>

        <Input label="Full Name" placeholder="Enter full name" required />

        <Input
          label="Email"
          type="email"
          placeholder="player@school.edu"
          required
        />

        <Input
          label="Jersey Number"
          type="number"
          placeholder="00"
          min={0}
          max={99}
        />

        <Input
          label="Position"
          placeholder="QB, RB, WR, etc."
          list="positions"
        />
        <datalist id="positions">
          <option value="QB" />
          <option value="RB" />
          <option value="WR" />
          <option value="TE" />
          <option value="OL" />
          <option value="DL" />
          <option value="LB" />
          <option value="DB" />
          <option value="K" />
          <option value="P" />
        </datalist>

        <Input
          variant="password"
          label="Temporary Password"
          placeholder="Create a password"
          helperText="Must be at least 8 characters"
        />
      </div>
    </div>
  ),
};
