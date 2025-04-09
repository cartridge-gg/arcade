import Details from "./details";
import Media from "./media";
import Metrics from "./metrics";

export function About() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Media />
      <Details content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
      <Metrics />
    </div>
  );
}
