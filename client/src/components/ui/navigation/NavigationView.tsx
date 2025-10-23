import type {
  NavigationViewModel,
  TabItem,
} from "@/features/navigation/useNavigationContext";
import { cn } from "@cartridge/ui";
import { Link } from "@tanstack/react-router";

export const NavigationView = ({ tabs }: NavigationViewModel) => {
  return (
    <div className="fixed bottom-0 lg:static flex flex-row gap-4 px-4 pb-2 lg:py-6 lg:px-0 w-full justify-center lg:w-auto lg:justify-start order-3 lg:order-2">
      {tabs.map((t: TabItem) => (
        <LinkItem key={t.href} item={t} />
      ))}
    </div>
  );
};

const baseItemClass =
  "relative flex-1 flex flex-row justify-center gap-1 items-center py-2 px-3 rounded-lg font-sans text-sm text-foreground-300 h-[71px] hover:text-primary-100 transition transition-colors duration-150 ease-in";
const lgItemClass =
  "lg:border lg:border-background-200 lg:flex-initial lg:h-auto lg:before:hidden lg:bg-background-125";
const activeItemClass =
  "data-[status=active]:text-primary-100 lg:data-[status=active]:border-primary-100 lg:data-[status=active]:bg-primary-100 lg:data-[status=active]:text-spacer-100";
const beforeItemClass =
  "before:content-[''] before:absolute before:h-px before:top-0 before:left-0 before:right-0 data-[status=active]:before:bg-primary-100";

function LinkItem({ item }: { item: TabItem }) {
  return (
    <>
      <Link
        to={item.href}
        activeOptions={{ exact: true }}
        className={cn(
          baseItemClass,
          lgItemClass,
          activeItemClass,
          beforeItemClass,
        )}
      >
        <item.icon
          variant="solid"
          className="h-8 w-8 text-3xl lg:h-6 lg:w-6 lg:text-sm"
        />{" "}
        <span className="hidden lg:block">{item.name}</span>
      </Link>
    </>
  );
}
