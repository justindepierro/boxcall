import type { Meta, StoryObj } from "@storybook/react";
import { GamePlanModal } from "./index";

const meta: Meta<typeof GamePlanModal> = {
  title: "Playbook/GamePlanModal",
  component: GamePlanModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A comprehensive game plan builder modal using the Billick Situational Method.
Allows coaches to create game plans with opponent details and assign plays to
12 standard game situations.

**Features:**
- Game plan metadata (name, opponent, date, location)
- 12 Billick situations with color coding
- Play assignment per situation with PlaySelectorModal
- Priority ordering within situations
- Drag-and-drop reordering
- Play removal functionality
- Wristband number display
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GamePlanModal>;

export const NewGamePlan: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (gamePlan) => console.log("Game plan saved:", gamePlan),
  },
};

export const EditExistingGamePlan: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (gamePlan) => console.log("Game plan updated:", gamePlan),
    initialGamePlan: {
      id: "game-plan-1",
      name: "Week 7 Game Plan",
      opponent: "Philadelphia Eagles",
      gameDate: "2024-10-27",
      gameLocation: "Home",
      situations: [
        {
          id: "sit-1",
          situationType: "first_and_10",
          plays: [
            {
              id: "play-1",
              playId: "play-123",
              playName: "22 Power",
              formation: "I-Form",
              personnel: "12 Personnel",
              wristbandNumber: "12",
              priority: 1,
            },
            {
              id: "play-2",
              playId: "play-124",
              playName: "Y Sail",
              formation: "Trips Right",
              personnel: "11 Personnel",
              wristbandNumber: "34",
              priority: 2,
            },
          ],
        },
      ],
      createdAt: new Date("2024-10-20"),
      updatedAt: new Date("2024-10-21"),
    },
  },
};

export const WithMultipleSituationsAssigned: Story = {
  args: {
    onClose: () => console.log("Modal closed"),
    onSave: (gamePlan) => console.log("Game plan saved:", gamePlan),
    initialGamePlan: {
      id: "game-plan-2",
      name: "Playoff Preparation",
      opponent: "Dallas Cowboys",
      gameDate: "2024-11-15",
      gameLocation: "Away",
      situations: [
        {
          id: "sit-1",
          situationType: "first_and_10",
          plays: [
            {
              id: "p1",
              playId: "play-1",
              playName: "Inside Zone",
              personnel: "12 Personnel",
              priority: 1,
            },
          ],
        },
        {
          id: "sit-2",
          situationType: "third_and_short",
          plays: [
            {
              id: "p2",
              playId: "play-2",
              playName: "Power O",
              personnel: "22 Personnel",
              priority: 1,
            },
            {
              id: "p3",
              playId: "play-3",
              playName: "QB Sneak",
              personnel: "Goal Line",
              priority: 2,
            },
          ],
        },
        {
          id: "sit-3",
          situationType: "red_zone",
          plays: [
            {
              id: "p4",
              playId: "play-4",
              playName: "Fade Corner",
              formation: "Trips",
              personnel: "10 Personnel",
              wristbandNumber: "88",
              priority: 1,
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};
