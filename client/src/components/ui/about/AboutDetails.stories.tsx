import type { Meta, StoryObj } from "@storybook/react-vite";
import { AboutDetails } from "./AboutDetails";

const meta = {
  title: "About/AboutDetails",
  component: AboutDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AboutDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShortText: Story = {
  args: {
    content:
      "Loot Survivor is a fully onchain arcade game on Starknet. Survive as long as you can.",
  },
};

export const LongText: Story = {
  args: {
    content:
      "Loot Survivor is a fully onchain arcade game built on Starknet. Players must navigate through dangerous dungeons, collect powerful loot, defeat fearsome beasts, and survive as long as possible. The game features permadeath mechanics, meaning every decision matters. Each run is unique with procedurally generated encounters and item drops. The deeper you go, the more dangerous it becomes, but the rewards grow exponentially. Will you risk it all for glory, or play it safe and live another day? Only the strongest adventurers will make it to the leaderboard. Every action is recorded onchain, making your achievements permanent and verifiable.",
  },
};

export const Empty: Story = {
  args: {
    content: "",
  },
};
