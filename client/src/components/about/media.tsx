import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { cn } from "@cartridge/ui/utils";
import { YoutubeEmbedIcon } from "./youtube-icon";

export function Media({ items }: { items: string[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (items.length === 0) return null;

  return (
    <div className="relative flex flex-col gap-2">
      <div className="h-10 flex items-center justify-between">
        <p className="text-xs tracking-wider font-semibold text-foreground-400">
          Media
        </p>
      </div>
      <Carousel
        opts={{
          dragFree: false,
          align: "start",
          loop: true,
        }}
        setApi={setApi}
      >
        <div className="flex flex-row-reverse items-center gap-3 lg:gap-4 h-10 absolute top-[-48px] right-2 ml-16">
          <div className="flex gap-3">
            <CarouselPrevious />
            <CarouselNext />
          </div>
          <div className="flex gap-px flex-wrap">
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex justify-center items-center h-3.5 w-3.5 select-none cursor-pointer opacity-50 hover:opacity-100 transition-all duration-300",
                  current === index + 1 && "opacity-100",
                )}
                onClick={() => api?.scrollTo(index)}
              >
                <div
                  key={index}
                  className={cn(
                    "size-[3px] bg-foreground-100 rounded-full",
                    current === index + 1 && "size-1",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute w-11 h-full z-10 right-0 pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent 0%, transparent 50%, var(--background-100) 100%`,
            }}
          />
          <CarouselContent className="flex gap-4">
            {items.map((item, index) =>
              item.includes("youtu") ? (
                <CarouselItem
                  key={item}
                  className="basis-[295px] lg:basis-[600px]"
                >
                  <Video
                    video={item}
                    active={current === index + 1}
                    shift={index === items.length - 1}
                  />
                </CarouselItem>
              ) : (
                <CarouselItem
                  key={item}
                  className="basis-[295px] lg:basis-[600px]"
                >
                  <Image image={item} shift={index === items.length - 1} />
                </CarouselItem>
              ),
            )}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  );
}

const Image = ({ image, shift }: { image: string; shift: boolean }) => {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden w-[295px] h-[160px] lg:w-[600px] lg:h-[320px]",
        shift && "pr-4",
      )}
    >
      <img className="w-full h-full object-cover" src={image} alt="Image" />
    </div>
  );
};

const Video = ({
  video,
  active,
  shift,
}: {
  video: string;
  active: boolean;
  shift: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden w-[295px] h-[160px] lg:w-[600px] lg:h-[320px]",
        shift && "pr-4",
      )}
    >
      <ReactPlayer
        url={video}
        width="100%"
        height="100%"
        loop={true}
        controls={false}
        muted={true}
        playing={active}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
            },
          },
        }}
      />
      <div className="absolute inset-0 z-10">
        <a
          href={video}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-5 right-5"
        >
          <YoutubeEmbedIcon
            className="hover:scale-110 transition-all duration-300"
            width={100}
            height={24}
            fill="white"
          />
        </a>
      </div>
    </div>
  );
};

export default Media;
