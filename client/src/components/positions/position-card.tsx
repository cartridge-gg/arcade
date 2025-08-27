import { ClockIcon, Thumbnail } from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";

export const PositionCard = () => {
  return (
    <div className="flex p-2 items-start gap-1 self-stretch rounded bg-background-200">
      <div className="gap-2 flex-1 flex items-center">
        <Thumbnail
          icon="https://static.cartridge.gg/presets/loot-survivor/icon.png"
          size="md"
          variant="lighter"
          className="!w-[34px] !h-[34px]"
        />
        <div className="flex flex-col items-start justify-center gap-1 flex-1">
          <div className="flex items-center gap-1 self-stretch">
            <div className="flex items-center px-0.5 gap-0.5 bg-background-150">
              <UserAvatar
                username="bal7hazar"
                size="sm"
                className="text-primary"
              />
              <div className="px-0.5 gap-2.5 flex items-center justify-center">
                <p className="text-primary text-sm font-normal">bal7hazar</p>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground-100">
              to win Season 1 of Blitz Eternum
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <ClockIcon
              variant="solid"
              size="xs"
              className="text-foreground-300"
            />
            <div className="flex items-center justify-center px-0.5 gap-2.5">
              <p className="text-xs font-normal text-foreground-300">
                2d 12h 5m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-[120px] flex-col items-start justify-center gap-1">
        <div className="flex items-center gap-1">
          <Thumbnail
            icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
            rounded
            size="xs"
            variant="lighter"
          />
          <p className="text-sm font-medium text-foreground-100">50</p>
        </div>
        <p className="text-foreground-300 text-xs font-normal">$16.54</p>
      </div>

      <div className="flex w-[120px] flex-col items-start justify-center gap-1">
        <div className="flex items-center gap-1">
          <Thumbnail
            icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
            rounded
            size="xs"
            variant="lighter"
          />
          <p className="text-sm font-medium text-foreground-100">50</p>
        </div>
        <p className="text-constructive-100 text-xs font-normal">
          +1,600 (150%)
        </p>
      </div>
    </div>
  );
};
