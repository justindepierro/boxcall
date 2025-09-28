import type { Meta, StoryObj } from "@storybook/react";
import { AdaptiveChart } from "./AdaptiveChart";
import type { DataSeries } from "../../services/smartDataAnalyzer";

const meta: Meta<typeof AdaptiveChart> = {
  title: "Dashboard/AdaptiveChart",
  component: AdaptiveChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
An intelligent chart component that automatically selects optimal visualization types and configurations based on data characteristics, screen size, and user context.

## Features

- **Smart Chart Selection**: Automatically chooses between line, bar, area, scatter, and gauge charts based on data analysis
- **Context-Aware**: Adapts configuration for dashboard, detail, and fullscreen contexts
- **Data Insights**: Generates actionable insights with confidence scores and priority levels
- **Responsive Design**: Automatically adjusts to different screen sizes
- **Interaction Levels**: Configurable interaction complexity (minimal, standard, advanced)
- **Color Schemes**: Context-appropriate color palettes for different data types

## Usage

Used throughout the dashboard to visualize team performance, attendance, progress tracking, and engagement metrics with intelligent recommendations and insights.
        `,
      },
    },
  },
  argTypes: {
    data: {
      control: "object",
      description: "Data series to visualize",
    },
    autoResize: {
      control: "boolean",
      description: "Whether the chart should automatically resize",
    },
    showInsights: {
      control: "boolean",
      description: "Whether to display smart insights panel",
    },
    interactionLevel: {
      control: "select",
      options: ["minimal", "standard", "advanced"],
      description: "Level of user interaction allowed",
    },
    context: {
      control: "select",
      options: ["dashboard", "detail", "fullscreen"],
      description: "Display context affecting chart configuration",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdaptiveChart>;

// Mock data for different scenarios
const performanceData: DataSeries = {
  id: "team-performance",
  name: "Team Performance Trends",
  type: "performance",
  context: "team",
  data: [
    {
      timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
      value: 75,
      label: "Week 1",
    },
    {
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      value: 78,
      label: "Week 2",
    },
    {
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      value: 82,
      label: "Week 3",
    },
    {
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      value: 79,
      label: "Week 4",
    },
    {
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      value: 85,
      label: "Week 5",
    },
    {
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      value: 88,
      label: "Week 6",
    },
  ],
};

const attendanceData: DataSeries = {
  id: "practice-attendance",
  name: "Practice Attendance",
  type: "attendance",
  context: "practice",
  data: [
    {
      timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
      value: 85,
      label: "Mon",
    },
    {
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      value: 92,
      label: "Tue",
    },
    {
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      value: 78,
      label: "Wed",
    },
    {
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      value: 88,
      label: "Thu",
    },
    {
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      value: 95,
      label: "Fri",
    },
    {
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      value: 82,
      label: "Sat",
    },
  ],
};

const progressData: DataSeries = {
  id: "player-progress",
  name: "Player Skill Development",
  type: "progress",
  context: "individual",
  data: [
    {
      timestamp: Date.now() - 8 * 7 * 24 * 60 * 60 * 1000,
      value: 60,
      label: "Month 1",
    },
    {
      timestamp: Date.now() - 7 * 7 * 24 * 60 * 60 * 1000,
      value: 65,
      label: "Month 2",
    },
    {
      timestamp: Date.now() - 6 * 7 * 24 * 60 * 60 * 1000,
      value: 68,
      label: "Month 3",
    },
    {
      timestamp: Date.now() - 5 * 7 * 24 * 60 * 60 * 1000,
      value: 72,
      label: "Month 4",
    },
    {
      timestamp: Date.now() - 4 * 7 * 24 * 60 * 60 * 1000,
      value: 75,
      label: "Month 5",
    },
    {
      timestamp: Date.now() - 3 * 7 * 24 * 60 * 60 * 1000,
      value: 78,
      label: "Month 6",
    },
    {
      timestamp: Date.now() - 2 * 7 * 24 * 60 * 60 * 1000,
      value: 82,
      label: "Month 7",
    },
    {
      timestamp: Date.now() - 1 * 7 * 24 * 60 * 60 * 1000,
      value: 85,
      label: "Month 8",
    },
  ],
};

const engagementData: DataSeries = {
  id: "team-engagement",
  name: "Team Engagement Score",
  type: "engagement",
  context: "team",
  data: [
    {
      timestamp: Date.now() - 4 * 7 * 24 * 60 * 60 * 1000,
      value: 7.2,
      label: "Week 1",
    },
    {
      timestamp: Date.now() - 3 * 7 * 24 * 60 * 60 * 1000,
      value: 7.8,
      label: "Week 2",
    },
    {
      timestamp: Date.now() - 2 * 7 * 24 * 60 * 60 * 1000,
      value: 6.9,
      label: "Week 3",
    },
    {
      timestamp: Date.now() - 1 * 7 * 24 * 60 * 60 * 1000,
      value: 8.1,
      label: "Week 4",
    },
  ],
};

export const PerformanceDashboard: Story = {
  args: {
    data: performanceData,
    context: "dashboard",
    showInsights: true,
    interactionLevel: "standard",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Performance data displayed in dashboard context with insights enabled.",
      },
    },
  },
};

export const AttendanceDetail: Story = {
  args: {
    data: attendanceData,
    context: "detail",
    showInsights: true,
    interactionLevel: "advanced",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Attendance data in detail view with advanced interactions and full insights.",
      },
    },
  },
};

export const ProgressFullscreen: Story = {
  args: {
    data: progressData,
    context: "fullscreen",
    showInsights: true,
    interactionLevel: "advanced",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Long-term progress data in fullscreen mode with comprehensive analysis.",
      },
    },
  },
};

export const EngagementMinimal: Story = {
  args: {
    data: engagementData,
    context: "dashboard",
    showInsights: false,
    interactionLevel: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Engagement data with minimal interactions and no insights panel.",
      },
    },
  },
};

export const NoInsights: Story = {
  args: {
    data: performanceData,
    context: "dashboard",
    showInsights: false,
    interactionLevel: "standard",
  },
  parameters: {
    docs: {
      description: {
        story: "Chart with insights disabled, showing only the visualization.",
      },
    },
  },
};

export const SmallDataSet: Story = {
  args: {
    data: {
      ...engagementData,
      data: engagementData.data.slice(0, 2), // Only 2 data points
    },
    context: "dashboard",
    showInsights: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Chart with limited data points to test edge cases.",
      },
    },
  },
};
