import type {
  NavigationViewModel,
  TabItem,
} from "@/features/navigation/useNavigationViewModel";
import { Link } from "@tanstack/react-router";

export const NavigationView = ({ tabs }: NavigationViewModel) => {
  return (
    <div className="flex flex-row gap-4 py-6">
      {tabs.map((t: TabItem) => (
        <LinkItem key={t.href} item={t} />
      ))}
    </div>
  );
};

function LinkItem({ item }: { item: TabItem }) {
  return (
    <>
      <Link
        to={item.href}
        className="flex flex-row gap-1 items-center border py-2 px-3 rounded-lg font-sans text-sm text-foreground-300 data-[status=active]:border-primary-100 data-[status=active]:bg-primary-100 data-[status=active]:text-background-500"
      >
        <item.icon variant="solid" size="sm" /> {item.name}
      </Link>
    </>
  );
}
