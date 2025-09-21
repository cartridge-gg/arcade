import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@cartridge/ui/utils";
import {
  ArcadeDiscoveryEvent,
  type ArcadeDiscoveryEventProps,
} from "./discovery-event";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";

interface ArcadeDiscoveryGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryGroupVariants> {
  events: ArcadeDiscoveryEventProps[];
  loading?: boolean;
  rounded?: boolean;
  identifier?: number;
}

export const arcadeDiscoveryGroupVariants = cva(
  "select-none flex flex-col gap-y-px data-[rounded=true]:rounded data-[rounded=true]:overflow-hidden",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeDiscoveryGroup = ({
  events,
  loading,
  rounded,
  identifier,
  variant,
  className,
  onClick,
  style,
  ...rest
}: ArcadeDiscoveryGroupProps) => {
  const [cachedIdentifier, setCachedIdentifier] = useState<number | undefined>(
    undefined,
  );
  const [isAnimated, setIsAnimated] = useState(true);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (identifier === cachedIdentifier) return;
    setCachedIdentifier(identifier);
    // Clear the ongoing timeout if it exists
    if (ref.current) {
      clearTimeout(ref.current);
    }
    // Case Game to Games or case Games to Game
    if (identifier === undefined || cachedIdentifier === undefined) {
      // We turn the animation on immediately
      setIsAnimated(true);
      return;
    }
    // Otherwise, case Game to Game
    // We turn the animation off immediately
    setIsAnimated(false);
    // We turn the animation on after 1s
    ref.current = setTimeout(() => {
      setIsAnimated(true);
    }, 1000);

    return () => {
      if (ref.current) {
        clearTimeout(ref.current);
      }
    };
  }, [ref, identifier]);

  return (
    <div
      data-rounded={rounded}
      className={cn(arcadeDiscoveryGroupVariants({ variant }), className)}
      style={style}
      {...rest}
    >
      {isAnimated ? (
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.identifier}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <ArcadeDiscoveryEvent
                loading={loading}
                className={className}
                variant={variant}
                onClick={onClick}
                {...event}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        events.map((event, index) => (
          <div key={index}>
            <ArcadeDiscoveryEvent
              loading={loading}
              className={className}
              variant={variant}
              onClick={onClick}
              {...event}
            />
          </div>
        ))
      )}
    </div>
  );
};
