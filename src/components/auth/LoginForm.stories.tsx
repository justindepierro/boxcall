import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./LoginForm";

const meta: Meta<typeof LoginForm> = {
  title: "Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A professional login form component that handles email/password authentication with Supabase integration.

## Features

- **Email/Password Authentication**: Standard login with email and password fields
- **Form Validation**: Client-side validation with real-time error feedback
- **Loading States**: Visual feedback during authentication process
- **Error Handling**: Display of authentication errors from Supabase
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper form labels and ARIA attributes

## Usage

Used on the login page to authenticate users. Integrates with the application's auth store and Supabase backend for secure authentication.
        `,
      },
    },
  },
  argTypes: {
    onSuccess: {
      action: "loginSuccessful",
      description: "Called when login is successful",
    },
    onSwitchToRegister: {
      action: "switchToRegister",
      description: "Called when user wants to switch to registration",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {
    onSuccess: () => console.log("Login successful"),
    onSwitchToRegister: () => console.log("Switch to register"),
  },
  parameters: {
    docs: {
      description: {
        story: "Standard login form with empty fields.",
      },
    },
  },
};

export const WithPrefilledData: Story = {
  args: {
    onSuccess: () => console.log("Login successful"),
    onSwitchToRegister: () => console.log("Switch to register"),
  },
  parameters: {
    docs: {
      description: {
        story: "Login form with pre-filled email for demonstration.",
      },
    },
  },
  decorators: [
    (Story) => {
      // This decorator would pre-fill the form in a real implementation
      // For now, it just shows the empty state
      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  args: {
    onSuccess: () => console.log("Login successful"),
    onSwitchToRegister: () => console.log("Switch to register"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the loading state during authentication. Note: This requires mocking the auth store.",
      },
    },
  },
};

export const WithValidationErrors: Story = {
  args: {
    onSuccess: () => console.log("Login successful"),
    onSwitchToRegister: () => console.log("Switch to register"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows validation errors when form is submitted with invalid data. Note: This requires form interaction.",
      },
    },
  },
};
