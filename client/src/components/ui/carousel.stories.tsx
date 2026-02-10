import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";

const meta = {
  title: "Compound/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Carousel>
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((i) => (
          <CarouselItem key={i}>
            <div className="p-6 bg-background-200 rounded-lg text-center">
              <span className="text-2xl font-semibold">Slide {i}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const WithImages: Story = {
  render: () => (
    <Carousel>
      <CarouselContent>
        {[1, 2, 3].map((i) => (
          <CarouselItem key={i}>
            <div className="aspect-video bg-background-300 rounded-lg flex items-center justify-center">
              <span className="text-foreground-400">Image {i}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const MultipleVisible: Story = {
  render: () => (
    <Carousel
      opts={{
        align: "start",
      }}
    >
      <CarouselContent className="-ml-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CarouselItem key={i} className="pl-2 basis-1/3">
            <div className="p-4 bg-background-200 rounded-lg text-center">
              <span className="text-lg font-medium">{i}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div className="h-[300px] w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Carousel orientation="vertical" className="h-full">
      <CarouselContent className="h-full">
        {[1, 2, 3].map((i) => (
          <CarouselItem key={i}>
            <div className="p-6 bg-background-200 rounded-lg text-center h-full flex items-center justify-center">
              <span className="text-2xl font-semibold">Slide {i}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
};

export const Loop: Story = {
  render: () => (
    <Carousel opts={{ loop: true }}>
      <CarouselContent>
        {[1, 2, 3].map((i) => (
          <CarouselItem key={i}>
            <div className="p-6 bg-background-200 rounded-lg text-center">
              <span className="text-2xl font-semibold">Slide {i}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};
