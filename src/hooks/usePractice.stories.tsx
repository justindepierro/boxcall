import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "Hooks/usePractice",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Practice management hooks for BoxCall",
      },
    },
  },
};

export default meta;

export const Placeholder: StoryObj = {
  render: () => (
    <div className="p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">usePractice Hooks</h3>
      <p>Stories for practice management hooks will be added here.</p>
    </div>
  ),
};
