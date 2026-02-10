import type { Meta, StoryObj } from "@storybook/react-vite";
import { PositionCard } from "./PositionCard";

const meta = {
  title: "Positions/PositionCard",
  component: PositionCard,
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
} satisfies Meta<typeof PositionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGameIcon =
  "https://static.cartridge.gg/presets/loot-survivor/icon.png";
const mockTokenIcon = "https://static.cartridge.gg/presets/credit/icon.svg";

export const Default: Story = {
  args: {
    gameIcon: mockGameIcon,
    description: "Loot Survivor #1234",
    username: "player123",
    userAvatarClassName: "",
    timeRemaining: "2h 30m",
    tokenIcon: mockTokenIcon,
    tokenAmount: "1,250",
    tokenValue: "$3,450.00",
    pnlAmount: "+12.5%",
    pnlClassName: "text-green-500",
  },
};

export const NegativePnl: Story = {
  args: {
    gameIcon: mockGameIcon,
    description: "Eternum Position",
    username: "trader99",
    userAvatarClassName: "",
    timeRemaining: "5h 15m",
    tokenIcon: mockTokenIcon,
    tokenAmount: "500",
    tokenValue: "$1,200.00",
    pnlAmount: "-8.3%",
    pnlClassName: "text-red-500",
  },
};

export const LargePosition: Story = {
  args: {
    gameIcon: mockGameIcon,
    description: "Dark Shuffle Bet",
    username: "whale_user",
    userAvatarClassName: "",
    timeRemaining: "12h",
    tokenIcon: mockTokenIcon,
    tokenAmount: "50,000",
    tokenValue: "$125,000.00",
    pnlAmount: "+45.2%",
    pnlClassName: "text-green-500",
  },
};

export const PositionList: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PositionCard
        gameIcon={mockGameIcon}
        description="Loot Survivor #1234"
        username="player1"
        userAvatarClassName=""
        timeRemaining="2h 30m"
        tokenIcon={mockTokenIcon}
        tokenAmount="1,250"
        tokenValue="$3,450.00"
        pnlAmount="+12.5%"
        pnlClassName="text-green-500"
      />
      <PositionCard
        gameIcon={mockGameIcon}
        description="Eternum Position"
        username="player2"
        userAvatarClassName=""
        timeRemaining="5h 15m"
        tokenIcon={mockTokenIcon}
        tokenAmount="500"
        tokenValue="$1,200.00"
        pnlAmount="-8.3%"
        pnlClassName="text-red-500"
      />
    </div>
  ),
};
