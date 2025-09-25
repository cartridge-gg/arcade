import { AchievementCard } from "@/components/modules/achievement-card";
import type { Item } from "@/hooks/achievements";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Socials } from "@cartridge/arcade";
import { useArcade } from "@/hooks/arcade";
import { toast } from "sonner";
import { useAccount } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";

const HIDDEN_GROUP = "Hidden";

export function Trophies({
  achievements,
  softview,
  enabled,
  socials,
  pins,
}: {
  achievements: Item[];
  softview: boolean;
  enabled: boolean;
  socials: Socials;
  pins: { [playerId: string]: string[] };
  earnings: number;
}) {
  const [groups, setGroups] = useState<{ [key: string]: Item[] }>({});

  useEffect(() => {
    const groups: { [key: string]: Item[] } = {};
    achievements.forEach((achievement) => {
      // If the achievement is hidden it should be shown in a dedicated group
      const group =
        achievement.hidden && !achievement.completed
          ? HIDDEN_GROUP
          : achievement.group;
      groups[group] = groups[group] || [];
      groups[group].push(achievement);
      groups[group]
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort((a, b) => a.index - b.index);
    });
    setGroups(groups);
  }, [achievements]);

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {Object.entries(groups)
        .filter(([group]) => group !== HIDDEN_GROUP)
        .map(([group, items]) => (
          <Group
            key={group}
            group={group}
            items={items}
            softview={softview}
            enabled={enabled}
            socials={socials}
            pins={pins}
          />
        ))}
      <Group
        key={HIDDEN_GROUP}
        group={HIDDEN_GROUP}
        items={(groups[HIDDEN_GROUP] || []).sort(
          (a, b) => a.earning - b.earning,
        )}
        softview={softview}
        enabled={enabled}
        socials={socials}
        pins={pins}
      />
    </div>
  );
}

function Group({
  group,
  items,
  softview,
  enabled,
  socials,
  pins,
}: {
  group: string;
  items: Item[];
  softview: boolean;
  enabled: boolean;
  socials: Socials;
  pins: { [playerId: string]: string[] };
}) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();

  const handlePin = useCallback(
    (
      pinned: boolean,
      achievementId: string,
      setLoading: (loading: boolean) => void,
    ) => {
      if (!account || (!enabled && !pinned)) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      const process = async () => {
        setLoading(true);
        try {
          const calls = pinned
            ? provider.social.unpin({ achievementId })
            : provider.social.pin({ achievementId });
          const res = await account.execute(calls);
          if (res) {
            toast.success(
              `Trophy ${pinned ? "unpinned" : "pinned"} successfully`,
            );
          }
        } catch (error) {
          console.error(error);
          toast.error(`Failed to ${pinned ? "unpin" : "pin"} trophy`);
        } finally {
          setLoading(false);
        }
      };
      process();
    },
    [enabled, account, connector],
  );

  const achievements = useMemo(() => {
    // Ensure pagination is allowed only for consistent page content
    const uniquePages = Array.from(new Set(items.map((item) => item.index)));
    const countPerPages = new Set(
      uniquePages.map(
        (page) => items.filter((item) => item.index === page).length,
      ),
    );
    const paginationAllowed = countPerPages.size === 1;
    return items.map((item) => {
      return {
        id: item.id,
        index: paginationAllowed ? item.index : 0,
        completed: item.completed,
        content: {
          points: item.earning,
          difficulty: Number.parseFloat(item.percentage),
          hidden: item.hidden,
          icon: item.hidden && !item.completed ? undefined : item.icon,
          title: item.title,
          description: item.description,
          tasks: item.tasks,
          timestamp: item.completed ? item.timestamp : undefined,
        },
        share:
          softview || !item.completed || !socials.website || !socials.twitter
            ? undefined
            : {
                website: socials.website,
                twitter: socials.twitter,
                timestamp: item.timestamp,
                points: item.earning,
                difficulty: Number.parseFloat(item.percentage),
                title: item.title,
              },
      };
    });
  }, [items, pins, handlePin]);

  return <AchievementCard name={group} achievements={achievements} />;
}
