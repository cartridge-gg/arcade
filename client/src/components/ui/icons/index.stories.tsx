import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayersIcon,
  ShareIcon,
  TraitsIcon,
  PlayIcon,
  CopyIcon,
  StudioIcon,
  DashboardIcon,
} from "./index";

const meta = {
  title: "Primitives/Icons",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const IconWrapper = ({
  children,
  name,
}: { children: React.ReactNode; name: string }) => (
  <div className="flex flex-col items-center gap-2 p-4 bg-background-200 rounded-lg w-24">
    <div className="text-foreground-100">{children}</div>
    <span className="text-xs text-foreground-300">{name}</span>
  </div>
);

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <IconWrapper name="Layers">
        <LayersIcon />
      </IconWrapper>
      <IconWrapper name="Share">
        <ShareIcon />
      </IconWrapper>
      <IconWrapper name="Traits">
        <TraitsIcon />
      </IconWrapper>
      <IconWrapper name="Play">
        <PlayIcon />
      </IconWrapper>
      <IconWrapper name="Copy">
        <CopyIcon size="default" />
      </IconWrapper>
      <IconWrapper name="Studio">
        <StudioIcon />
      </IconWrapper>
      <IconWrapper name="Dashboard">
        <DashboardIcon />
      </IconWrapper>
    </div>
  ),
};

export const CopyIconSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <IconWrapper name="2xs">
        <CopyIcon size="2xs" />
      </IconWrapper>
      <IconWrapper name="xs">
        <CopyIcon size="xs" />
      </IconWrapper>
      <IconWrapper name="sm">
        <CopyIcon size="sm" />
      </IconWrapper>
      <IconWrapper name="default">
        <CopyIcon size="default" />
      </IconWrapper>
      <IconWrapper name="lg">
        <CopyIcon size="lg" />
      </IconWrapper>
      <IconWrapper name="xl">
        <CopyIcon size="xl" />
      </IconWrapper>
    </div>
  ),
};

export const LayersIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Layers">
      <LayersIcon />
    </IconWrapper>
  ),
};

export const ShareIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Share">
      <ShareIcon />
    </IconWrapper>
  ),
};

export const TraitsIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Traits">
      <TraitsIcon />
    </IconWrapper>
  ),
};

export const PlayIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Play">
      <PlayIcon />
    </IconWrapper>
  ),
};

export const StudioIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Studio">
      <StudioIcon />
    </IconWrapper>
  ),
};

export const DashboardIconDisplay: Story = {
  render: () => (
    <IconWrapper name="Dashboard">
      <DashboardIcon />
    </IconWrapper>
  ),
};
