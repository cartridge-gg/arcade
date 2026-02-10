import { Skeleton } from "@cartridge/ui";
import { GameCard } from "./GameCard";
import type { DashboardViewModel } from "@/features/dashboard/useDashboardViewModel";

const getGameSlug = (name: string, id: number) =>
  (name || id.toString()).toLowerCase().replace(/ /g, "-");

export const DashboardView = ({
  featuredGames,
  allGames,
  isLoading,
}: DashboardViewModel) => {
  if (isLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {featuredGames.length > 0 && (
        <section>
          <h2 className="text-xs tracking-wider font-semibold text-foreground-400 mb-3">
            Featured Games
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featuredGames.map((game) => (
              <GameCard
                key={game.id}
                size="large"
                name={game.name}
                icon={game.icon}
                cover={game.cover}
                href={`/game/${getGameSlug(game.name, game.id)}`}
                color={game.color}
                studio={game.studio}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs tracking-wider font-semibold text-foreground-400 mb-3">
          All Games
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {allGames.map((game) => (
            <GameCard
              key={game.id}
              size="small"
              name={game.name}
              icon={game.icon}
              cover={game.cover}
              href={`/game/${getGameSlug(game.name, game.id)}`}
              color={game.color}
              studio={game.studio}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const DashboardLoadingState = () => {
  return (
    <div className="flex flex-col gap-6 py-3">
      <section>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] lg:h-[240px] rounded-lg" />
          <Skeleton className="h-[200px] lg:h-[240px] rounded-lg" />
        </div>
      </section>
      <section>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] lg:h-[180px] rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
};
