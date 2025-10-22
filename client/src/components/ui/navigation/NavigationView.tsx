import type {
  NavigationViewModel,
  TabItem,
} from "@/features/navigation/useNavigationViewModel";
import { cn } from "@cartridge/ui";
import { Link } from "@tanstack/react-router";

export const NavigationView = ({ tabs }: NavigationViewModel) => {
  return (
    <div className="fixed bottom-0 lg:static flex flex-row gap-4 p-0 lg:py-6 w-full justify-center lg:w-auto lg:justify-start">
      {tabs.map((t: TabItem) => (
        <LinkItem key={t.href} item={t} />
      ))}
    </div>
  );
};

const baseItemClass =
  "relative flex-1 flex flex-row justify-center gap-1 items-center py-2 px-3 rounded-lg font-sans text-sm text-foreground-300 h-[71px]";
const lgItemClass = "lg:border lg:flex-initial lg:h-auto lg:before:hidden";
const activeItemClass =
  "data-[status=active]:text-primary-100 lg:data-[status=active]:border-primary-100 lg:data-[status=active]:bg-primary-100 lg:data-[status=active]:text-background-500";
const beforeItemClass =
  "before:content-[''] before:absolute before:h-px before:top-0 before:left-0 before:right-0 data-[status=active]:before:bg-primary-100";

function LinkItem({ item }: { item: TabItem }) {
  return (
    <>
      <Link
        to={item.href}
        className={cn(
          baseItemClass,
          lgItemClass,
          activeItemClass,
          beforeItemClass,
        )}
      >
        <item.icon variant="solid" size="sm" />{" "}
        <span className="hidden lg:block">{item.name}</span>
      </Link>
    </>
  );
}
