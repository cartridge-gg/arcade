import type {
  NavigationViewModel,
  TabItem,
} from "@/features/navigation/useNavigationContext";
import { Link } from "@tanstack/react-router";
import { NavigationButton } from "@/components/ui/modules/link-item";

export const NavigationView = ({ tabs }: NavigationViewModel) => {
  return (
    <div className="fixed bottom-0 lg:static flex flex-row gap-4 px-4 pb-2 lg:pb-4 lg:px-0 w-full justify-center lg:w-auto lg:justify-start order-3 lg:order-2">
      {tabs.map((t: TabItem) => (
        <NavigationButton key={t.href} asChild>
          <Link to={t.href} activeOptions={{ exact: t.tab !== "inventory" }}>
            <t.icon
              variant={t.props?.variant || "solid"}
              className="h-8 w-8 text-3xl lg:h-6 lg:w-6 lg:text-sm"
            />{" "}
            <span className="hidden lg:block">{t.name}</span>
          </Link>
        </NavigationButton>
      ))}
    </div>
  );
};
