import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Select from "./Select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive select component with search, multi-select, validation, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "filled", "outlined"],
    },
    status: {
      control: { type: "select" },
      options: ["default", "error", "success", "warning"],
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    searchable: {
      control: "boolean",
    },
    multiple: {
      control: "boolean",
    },
    required: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const positionOptions = [
  { value: "qb", label: "Quarterback" },
  { value: "rb", label: "Running Back" },
  { value: "wr", label: "Wide Receiver" },
  { value: "te", label: "Tight End" },
  { value: "ol", label: "Offensive Line" },
  { value: "dl", label: "Defensive Line" },
  { value: "lb", label: "Linebacker" },
  { value: "db", label: "Defensive Back" },
  { value: "k", label: "Kicker" },
  { value: "p", label: "Punter" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <Select
        label="Position"
        placeholder="Select a position"
        options={positionOptions}
        value={value}
        onChange={(val) => setValue(val as string)}
      />
    );
  },
};

export const WithHelperText: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <Select
        label="Favorite Team"
        placeholder="Choose your team"
        options={[
          { value: "patriots", label: "New England Patriots" },
          { value: "chiefs", label: "Kansas City Chiefs" },
          { value: "eagles", label: "Philadelphia Eagles" },
          { value: "packers", label: "Green Bay Packers" },
        ]}
        value={value}
        onChange={(val) => setValue(val as string)}
        helperText="This will be displayed on your profile"
      />
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <Select
        label="Player"
        placeholder="Search for a player"
        options={Array.from({ length: 50 }, (_, i) => ({
          value: `player-${i + 1}`,
          label: `Player ${i + 1}`,
        }))}
        value={value}
        onChange={(val) => setValue(val as string)}
        searchable={true}
      />
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);

    return (
      <Select
        label="Skills"
        placeholder="Select skills"
        options={[
          { value: "passing", label: "Passing" },
          { value: "rushing", label: "Rushing" },
          { value: "receiving", label: "Receiving" },
          { value: "blocking", label: "Blocking" },
          { value: "tackling", label: "Tackling" },
          { value: "coverage", label: "Coverage" },
          { value: "special-teams", label: "Special Teams" },
        ]}
        value={values}
        onChange={(val) =>
          setValues(Array.isArray(val) ? (val as string[]) : [val as string])
        }
        multiple={true}
        helperText="Select all that apply"
      />
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const [errorValue, setErrorValue] = useState("");
    const [successValue, setSuccessValue] = useState("qb");
    const [warningValue, setWarningValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <Select
          label="Required Field"
          placeholder="Select an option"
          options={positionOptions}
          value={errorValue}
          onChange={(val) => setErrorValue(val as string)}
          status="error"
          errorMessage="This field is required"
          required
        />

        <Select
          label="Valid Selection"
          placeholder="Select a position"
          options={positionOptions}
          value={successValue}
          onChange={(val) => setSuccessValue(val as string)}
          status="success"
          successMessage="Great choice!"
        />

        <Select
          label="Optional Field"
          placeholder="Select if applicable"
          options={positionOptions}
          value={warningValue}
          onChange={(val) => setWarningValue(val as string)}
          status="warning"
          warningMessage="Consider selecting a position"
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
        <Select
          size="sm"
          label="Small Select"
          placeholder="Small size"
          options={positionOptions}
          value={smValue}
          onChange={(val) => setSmValue(val as string)}
        />

        <Select
          size="md"
          label="Medium Select"
          placeholder="Medium size (default)"
          options={positionOptions}
          value={mdValue}
          onChange={(val) => setMdValue(val as string)}
        />

        <Select
          size="lg"
          label="Large Select"
          placeholder="Large size"
          options={positionOptions}
          value={lgValue}
          onChange={(val) => setLgValue(val as string)}
        />
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [defaultValue, setDefaultValue] = useState("");
    const [filledValue, setFilledValue] = useState("");
    const [outlinedValue, setOutlinedValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <Select
          variant="default"
          label="Default Variant"
          placeholder="Default styling"
          options={positionOptions}
          value={defaultValue}
          onChange={(val) => setDefaultValue(val as string)}
        />

        <Select
          variant="filled"
          label="Filled Variant"
          placeholder="Filled styling"
          options={positionOptions}
          value={filledValue}
          onChange={(val) => setFilledValue(val as string)}
        />

        <Select
          variant="outlined"
          label="Outlined Variant"
          placeholder="Outlined styling"
          options={positionOptions}
          value={outlinedValue}
          onChange={(val) => setOutlinedValue(val as string)}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Select",
    placeholder: "This select is disabled",
    options: positionOptions,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    label: "Loading Select",
    placeholder: "Loading options...",
    options: positionOptions,
    loading: true,
  },
};
