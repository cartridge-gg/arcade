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

const VIDEOS = [
  "https://youtu.be/bkNF9VdY2-o?si=Fh2KQLC1-qQmYPlG",
  "https://youtu.be/-ptcWqcGiuo?si=eslLenE0vRqL-bRM",
  "https://youtube.com/shorts/OU8rqBxHdDI?si=mgZ9zLA1wc6OWzfB",
];

const IMAGES = [
  "https://repository-images.githubusercontent.com/614510733/32e5253b-7fd6-4e39-b536-9678ee2557bc",
  "https://pbs.twimg.com/media/GI6077pW8AA6wrt?format=jpg&name=large",
];

export function Media() {
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
        <div className="flex flex-row-reverse items-center gap-4 h-10 absolute top-[-48px] right-2 ml-16">
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
            className="absolute w-11 h-full z-10 right-0"
            style={{
              background: `linear-gradient(to right, transparent 0%, transparent 50%, var(--background-100) 100%`,
            }}
          />
          <CarouselContent className="flex gap-4">
            {Array.from({ length: VIDEOS.length }).map((_, index) => (
              <CarouselItem key={index} className="basis-[600px]">
                <div
                  className={cn(
                    "rounded-lg overflow-hidden w-[600px] h-[320px]",
                    index === VIDEOS.length - 1 && !IMAGES.length && "pr-4",
                  )}
                >
                  <ReactPlayer
                    url={VIDEOS[index]}
                    width="100%"
                    height="100%"
                    loop
                    controls
                  />
                </div>
              </CarouselItem>
            ))}
            {Array.from({ length: IMAGES.length }).map((_, index) => (
              <CarouselItem key={index} className="basis-[600px]">
                <div
                  className={cn(
                    "rounded-lg overflow-hidden w-[600px] h-[320px]",
                    index === IMAGES.length - 1 && "pr-4",
                  )}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={IMAGES[index]}
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
