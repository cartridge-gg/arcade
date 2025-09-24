import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  ClockIcon,
  cn,
  Thumbnail,
} from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";

export interface PredictCardProps {
  image: string;
  title: string;
  subtitle?: string;
  user1Name: string;
  user1Score: number;
  user2Name: string;
  user2Score: number;
  price: string;
  time: string;
  className?: string;
}

export const PredictCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & PredictCardProps
>(
  (
    {
      image,
      title,
      subtitle,
      user1Name,
      user1Score,
      user2Name,
      user2Score,
      price,
      time,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        className={cn("w-60 rounded bg-background-200", className)}
        ref={ref}
        {...props}
      >
        <CardHeader className="p-2 flex flex-row items-center justify-start gap-2 bg-background-200">
          <Thumbnail
            icon={image}
            size="md"
            variant="lighter"
            className="w-10 h-10"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-foreground-100 text-sm font-medium truncate">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-foreground-100 text-sm font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </CardHeader>

        <div className="bg-background-200 p-2 space-y-2">
          {/* User scores */}
          <div className="space-y-px">
            <div className="flex items-center justify-between px-2 py-1.5 bg-background-150 rounded-t">
              <div className="flex items-center gap-1">
                <UserAvatar username={user1Name} size="sm" />
                <span className="text-foreground-100 text-sm font-normal">
                  {user1Name}
                </span>
              </div>
              <span className="text-primary font-medium text-sm">
                {user1Score}%
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 bg-background-150 rounded-b">
              <div className="flex items-center gap-1">
                <UserAvatar username={user2Name} size="sm" />
                <span className="text-foreground-100 text-sm font-normal">
                  {user2Name}
                </span>
              </div>
              <span className="text-primary font-medium text-sm">
                {user2Score}%
              </span>
            </div>
          </div>

          {/* Price and time */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Thumbnail
                icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
                size="xs"
                rounded
                variant="lightest"
                className="w-5 h-5"
              />
              <span className="text-foreground-300 text-xs font-normal">
                {price}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <ClockIcon
                variant="solid"
                size="sm"
                className="text-foreground-300"
              />
              <span className="text-foreground-300 text-xs font-normal">
                {time}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

export default PredictCard;
