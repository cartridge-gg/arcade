import type { Meta, StoryObj } from "@storybook/react-vite";
import { PredictCard } from "./PredictCard";

const meta = {
  title: "Predict/PredictCard",
  component: PredictCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PredictCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage = "https://static.cartridge.gg/presets/loot-survivor/icon.png";

export const Default: Story = {
  args: {
    image: mockImage,
    title: "Championship Finals",
    subtitle: "Best of 3",
    user1Name: "player_alpha",
    user1Score: 2,
    user2Name: "player_beta",
    user2Score: 1,
    price: "100 LORDS",
    time: "2h 30m",
  },
};

export const TiedScore: Story = {
  args: {
    image: mockImage,
    title: "Quarterfinals",
    user1Name: "warrior",
    user1Score: 1,
    user2Name: "mage",
    user2Score: 1,
    price: "50 LORDS",
    time: "45m",
  },
};

export const HighStakes: Story = {
  args: {
    image: mockImage,
    title: "Grand Tournament",
    subtitle: "Season 3 Finals",
    user1Name: "champion_2024",
    user1Score: 5,
    user2Name: "challenger",
    user2Score: 4,
    price: "10,000 LORDS",
    time: "15m",
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <PredictCard
        image={mockImage}
        title="Match A"
        user1Name="alice"
        user1Score={3}
        user2Name="bob"
        user2Score={1}
        price="100 LORDS"
        time="1h"
      />
      <PredictCard
        image={mockImage}
        title="Match B"
        subtitle="Semifinals"
        user1Name="charlie"
        user1Score={0}
        user2Name="dave"
        user2Score={0}
        price="250 LORDS"
        time="3h"
      />
    </div>
  ),
};
