import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import SegmentedControl from "./SegmentedControl";
import type { SegmentOption } from "./SegmentedControl";
import { Icon } from "../Icon/Icon";

const meta: Meta<typeof SegmentedControl> = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A segmented control component for switching between mutually exclusive options.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const viewOptions: SegmentOption[] = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
  { id: "table", label: "Table" },
];

const alignmentOptions: SegmentOption[] = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

const statusOptions: SegmentOption[] = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "pending", label: "Pending" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("list");

    return (
      <SegmentedControl
        options={viewOptions}
        value={value}
        onChange={setValue}
        ariaLabel="View options"
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState("list");

    const optionsWithIcons: SegmentOption[] = [
      { id: "list", label: "List", icon: <Icon name="list" size="sm" /> },
      { id: "grid", label: "Grid", icon: <Icon name="grid" size="sm" /> },
      {
        id: "table",
        label: "Table",
        icon: <Icon name="clipboard-list" size="sm" />,
      },
    ];

    return (
      <SegmentedControl
        options={optionsWithIcons}
        value={value}
        onChange={setValue}
        ariaLabel="View options with icons"
      />
    );
  },
};

export const TextAlignment: Story = {
  render: () => {
    const [value, setValue] = useState("left");

    return (
      <SegmentedControl
        options={alignmentOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Text alignment"
      />
    );
  },
};

export const StatusFilter: Story = {
  render: () => {
    const [value, setValue] = useState("active");

    return (
      <SegmentedControl
        options={statusOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Status filter"
      />
    );
  },
};

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState("on");

    const toggleOptions: SegmentOption[] = [
      { id: "on", label: "On" },
      { id: "off", label: "Off" },
    ];

    return (
      <SegmentedControl
        options={toggleOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Toggle switch"
      />
    );
  },
};

export const FourOptions: Story = {
  render: () => {
    const [value, setValue] = useState("daily");

    const frequencyOptions: SegmentOption[] = [
      { id: "daily", label: "Daily" },
      { id: "weekly", label: "Weekly" },
      { id: "monthly", label: "Monthly" },
      { id: "yearly", label: "Yearly" },
    ];

    return (
      <SegmentedControl
        options={frequencyOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Frequency selection"
      />
    );
  },
};

export const WithCustomClassName: Story = {
  render: () => {
    const [value, setValue] = useState("small");

    const sizeOptions: SegmentOption[] = [
      { id: "small", label: "Small" },
      { id: "medium", label: "Medium" },
      { id: "large", label: "Large" },
    ];

    return (
      <SegmentedControl
        options={sizeOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Size selection"
        className="bg-blue-50 border-blue-200"
      />
    );
  },
};
