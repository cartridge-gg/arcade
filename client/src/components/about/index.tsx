import Details from "./details";
import Media from "./media";
import Metrics from "./metrics";
import { GameModel } from "@bal7hazar/arcade-sdk";

export function About({ game }: { game: GameModel }) {
  return (
    <div className="flex flex-col gap-4 py-3 lg:py-6">
      <Media
        videos={game.socials.videos?.filter((v) => !!v) ?? []}
        images={game.socials.images?.filter((i) => !!i) ?? []}
      />
      <Details content={game.metadata.description || ""} />
      <Metrics />
    </div>
  );
}
