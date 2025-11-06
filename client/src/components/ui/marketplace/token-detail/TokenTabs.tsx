import { PulseIcon } from "@cartridge/ui";
import { NavigationButton } from "@/components/ui/modules/link-item";
import { TraitsIcon } from "@/components/ui/icons";

type TabValue = "activity" | "traits";

interface TokenTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function TokenTabs({ activeTab, onTabChange }: TokenTabsProps) {
  return (
    <div className="flex items-center gap-3">
      <NavigationButton
        variant="tab"
        onClick={() => onTabChange("activity")}
        data-status={activeTab === "activity" ? "active" : undefined}
      >
        <PulseIcon size="sm" variant={"line"} />
        <span>Activity</span>
      </NavigationButton>
      <NavigationButton
        variant="tab"
        onClick={() => onTabChange("traits")}
        data-status={activeTab === "traits" ? "active" : undefined}
      >
        <TraitsIcon />
        <span>Traits</span>
      </NavigationButton>
    </div>
  );
}
