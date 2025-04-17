import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { cn } from "@cartridge/ui-next";
import { YoutubeEmbedIcon } from "./youtube-icon";

export function Media({
  videos,
  images,
}: {
  videos: string[];
  images: string[];
}) {
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

  if (!videos.length && !images.length) return null;

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
            {videos.map((video, index) => (
              <CarouselItem
                key={index}
                className="basis-[295px] lg:basis-[600px]"
              >
                <div
                  className={cn(
                    "relative rounded-lg overflow-hidden w-[295px] h-[160px] lg:w-[600px] lg:h-[320px]",
                    index === videos.length - 1 && !images.length && "pr-4",
                  )}
                >
                  <ReactPlayer
                    url={video}
                    width="100%"
                    height="100%"
                    loop={true}
                    controls={false}
                    muted={true}
                    playing={current === index + 1}
                    config={{
                      // attempting to remove recommendation(not working)
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
              </CarouselItem>
            ))}
            {images.map((image, index) => (
              <CarouselItem
                key={index}
                className="basis-[295px] lg:basis-[600px]"
              >
                <div
                  className={cn(
                    "rounded-lg overflow-hidden w-[295px] h-[160px] lg:w-[600px] lg:h-[320px]",
                    index === images.length - 1 && "pr-4",
                  )}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={image}
                    alt={`Image ${index}`}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  );
}

export default Media;
