import { Empty } from "@cartridge/ui";

export function Guilds() {
  return <EmptyState />;
}

const EmptyState = () => {
  return (
    <Empty title="Coming soon" icon="guild" className="h-full py-3 lg:py-6" />
  );
};
