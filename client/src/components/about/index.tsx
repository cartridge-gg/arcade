import Details from "./details";
import Media from "./media";
import Metrics from "./metrics";
import { EditionModel } from "@bal7hazar/arcade-sdk";

export function About({ edition }: { edition: EditionModel }) {
  return (
    <div className="flex flex-col gap-4 py-3 lg:py-6">
      <Media
        videos={edition.socials.videos?.filter((v) => !!v) ?? []}
        images={edition.socials.images?.filter((i) => !!i) ?? []}
      />
      <Details content={edition.description || ""} />
      <Metrics />
    </div>
  );
}
