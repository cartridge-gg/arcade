import { useDevice } from "@/hooks/device";
import { useSidebar } from "@/hooks/sidebar";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
} from "@cartridge/ui";

export const PredictionSidebar = () => {
  const { isMobile } = useDevice();
  const { isOpen, handleTouchStart, handleTouchMove } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-clip lg:rounded-xl border-r border-spacer-100 lg:border-none lg:border-background-200",
        "h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px]",
        isMobile && "fixed z-50 top-0 left-0", // Fixed position for mobile
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Slide in/out animation
        "transition-transform duration-300 ease-in-out", // Smooth transition
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <Card className="bg-background-125 border border-background-200 rounded-xl p-4 gap-2">
        <CardHeader className="px-2 py-3 bg-background-125">
          <CardTitle className="text-foreground-400 text-xs font-semibold">
            Vault Details
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-background-125 space-y-2 p-0">
          <div
            id="metric"
            className="py-4 px-6 flex flex-col items-start justify-center gap-1 self-stretch bg-background-200 rounded w-full"
          >
            <div className="flex items-center gap-1">
              <Thumbnail
                size="xs"
                variant="lighter"
                icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
              />
              <p className="text-foreground-100 text-base/5 font-light font-mono">
                8,800
              </p>
            </div>
            <h1 className="text-xs font-normal text-foreground-300">
              Vault Total
            </h1>
          </div>
          <div className="flex items-start gap-3 self-stretch">
            <div
              id="metric"
              className="py-4 px-6 flex flex-col items-start justify-center gap-1 self-stretch bg-background-200 rounded w-full"
            >
              <div className="flex items-center gap-1">
                <Thumbnail
                  size="xs"
                  variant="lighter"
                  icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
                />
                <p className="text-foreground-100 text-base/5 font-light font-mono">
                  2,200
                </p>
              </div>
              <h1 className="text-xs font-normal text-foreground-300">
                Your Stake
              </h1>
            </div>
            <div
              id="metric"
              className="py-4 px-6 flex flex-col items-start justify-center gap-1 self-stretch bg-background-200 rounded w-full"
            >
              <div className="flex items-center gap-1">
                <Thumbnail
                  size="xs"
                  variant="lighter"
                  icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
                />
                <p className="text-foreground-100 text-base/5 font-light font-mono">
                  34
                </p>
              </div>
              <h1 className="text-xs font-normal text-foreground-300">
                Fees Earned
              </h1>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-background-125 border border-background-200 rounded-xl p-4 gap-2">
        <CardHeader className="px-2 py-3 bg-background-125">
          <CardTitle className="text-foreground-400 text-xs font-semibold">
            Market Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-background-125 space-y-2 p-0 px-2 pb-2">
          <div className="flex items-center justify-between self-stretch">
            <p className="text-foreground-200 text-xs font-normal">Protocol</p>
            <p className="text-foreground-100 text-xs font-normal">0.3%</p>
          </div>
          <div className="flex items-center justify-between self-stretch">
            <p className="text-foreground-200 text-xs font-normal">Oracle</p>
            <p className="text-foreground-100 text-xs font-normal">0.5%</p>
          </div>
          <div className="flex items-center justify-between self-stretch">
            <p className="text-foreground-200 text-xs font-normal">Creator</p>
            <p className="text-foreground-100 text-xs font-normal">4.2%</p>
          </div>
          <div className="flex items-center justify-between self-stretch">
            <p className="text-foreground-200 text-xs font-normal">Vault</p>
            <p className="text-foreground-100 text-xs font-normal">1.39%</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-background-125 border border-background-200 rounded-xl p-4 gap-2">
        <Button variant="primary" className="bg-primary h-10 px-6 py-2.5">
          <span className="text-translucent-dark-300 text-base/5 font-semibold">
            RESOLVE MARKET
          </span>
        </Button>
      </Card>
    </div>
  );
};
