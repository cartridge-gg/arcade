import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingLoadingSpinner } from "./floating-loading-spinner";

const meta = {
  title: "Primitives/FloatingLoadingSpinner",
  component: FloatingLoadingSpinner,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative h-[300px] w-full bg-background-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingLoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: true,
  },
};

export const WithProgress: Story = {
  args: {
    isLoading: true,
    loadingProgress: {
      completed: 45,
      total: 100,
    },
  },
};

export const WithMessage: Story = {
  args: {
    isLoading: true,
    loadingMessage: "Loading tokens...",
  },
};

export const WithProgressAndMessage: Story = {
  args: {
    isLoading: true,
    loadingProgress: {
      completed: 75,
      total: 200,
    },
    loadingMessage: "Fetching collection data",
  },
};

export const Hidden: Story = {
  args: {
    isLoading: false,
  },
};
