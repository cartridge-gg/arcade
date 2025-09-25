import { Progress, Trophy, Task } from "@/models";

export interface Progressions {
  [game: string]: { [key: string]: Progress };
}

export interface Trophies {
  [game: string]: { [key: string]: Trophy };
}

export interface AchievementData {
  [game: string]: {
    [playerId: string]: {
      [achievementId: string]: {
        [taskId: string]: {
          completion: boolean;
          timestamp: number;
          count: number;
        };
      };
    };
  };
}

export interface AchievementStats {
  [game: string]: { [key: string]: number };
}

export interface AchievementPlayers {
  [game: string]: Player[];
}

export interface AchievementGlobals {
  [key: string]: Player;
}

export interface AchievementEvents {
  [game: string]: Event[];
}

export interface Event {
  identifier: string;
  player: string;
  achievement: {
    title: string;
    icon: string;
    points: number;
  };
  timestamp: number;
}

export interface Player {
  address: string;
  earnings: number;
  timestamp: number;
  completeds: string[];
}

export interface Achievements {
  [game: string]: Item[];
}

export interface ItemTask {
  id: string;
  count: number;
  total: number;
  description: string;
}

export interface Item {
  id: string;
  hidden: boolean;
  index: number;
  earning: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  timestamp: number;
  percentage: string;
  completed: boolean;
  pinned: boolean;
  tasks: ItemTask[];
}

export const AchievementHelper = {
  extract(progressions: Progressions, trophies: Trophies): AchievementData {
    // Compute players and achievement stats
    const data: AchievementData = {};
    Object.keys(progressions).forEach((game) => {
      data[game] = {};
      Object.values(progressions[game]).forEach((progress: Progress) => {
        if (!trophies[game]) return;
        const { achievementId, playerId, taskId, taskTotal, total, timestamp } =
          progress;
        // Compute player
        const detaultTasks: { [taskId: string]: { completion: boolean } } = {};
        const trophy = trophies[game][achievementId];
        if (!trophy) return;
        trophy.tasks.forEach(
          (task: Task) => (detaultTasks[task.id] = { completion: false }),
        );
        data[game][playerId] = data[game][playerId] || {};
        data[game][playerId][achievementId] =
          data[game][playerId][achievementId] || detaultTasks;
        data[game][playerId][achievementId][taskId] = {
          completion: total >= taskTotal,
          timestamp,
          count: total,
        };
      });
    });
    return data;
  },

  computePlayers(
    data: AchievementData,
    trophies: Trophies,
  ): {
    stats: AchievementStats;
    players: AchievementPlayers;
    events: AchievementEvents;
    globals: Player[];
  } {
    const stats: AchievementStats = {};
    const players: AchievementPlayers = {};
    const globals: AchievementGlobals = {};
    const events: AchievementEvents = {};
    Object.keys(data).forEach((game) => {
      stats[game] = {};
      events[game] = [];
      const gamePlayers = Object.keys(data[game]).map((playerId) => {
        const player = data[game][playerId];
        const completeds: string[] = [];
        let timestamp = 0;
        const earnings = Object.keys(player).reduce((acc, achievementId) => {
          const completion = Object.values(player[achievementId]).every(
            (task) => task.completion,
          );
          if (completion) {
            // Update player game stats
            completeds.push(achievementId);
            stats[game][achievementId] = stats[game][achievementId] || 0;
            stats[game][achievementId] += 1;
            // Update player game timestamp
            const completionTimestamp = Math.max(
              ...Object.values(player[achievementId]).map(
                (task) => task.timestamp,
              ),
            );
            timestamp = Math.max(timestamp, completionTimestamp);
            // Add completion event timestamp to events
            const event: Event = {
              identifier: `${game}-${achievementId}-${playerId}`,
              player: playerId,
              achievement: {
                title: trophies[game][achievementId].title,
                icon: trophies[game][achievementId].icon,
                points: trophies[game][achievementId].earning,
              },
              timestamp: completionTimestamp,
            };
            events[game].push(event);
          }
          return acc + (completion ? trophies[game][achievementId].earning : 0);
        }, 0);
        // Feed the global leaderboard
        if (!globals[playerId]) {
          globals[playerId] = {
            address: playerId,
            earnings,
            timestamp,
            completeds,
          };
        } else {
          globals[playerId].earnings += earnings;
          globals[playerId].timestamp = Math.max(
            globals[playerId].timestamp,
            timestamp,
          );
        }
        return {
          address: playerId,
          earnings,
          timestamp: timestamp,
          completeds,
        };
      });
      players[game] = Object.values(gamePlayers)
        .sort((a, b) => a.timestamp - b.timestamp) // Oldest to newest
        .sort((a, b) => b.earnings - a.earnings); // Highest to lowest
      events[game] = events[game].sort((a, b) => b.timestamp - a.timestamp); // Newest to oldest
    });
    return {
      stats,
      players,
      events,
      globals: Object.values(globals)
        .sort((a, b) => a.timestamp - b.timestamp)
        .sort((a, b) => b.earnings - a.earnings),
    };
  },

  computeAchievements(
    data: AchievementData,
    trophies: Trophies,
    players: AchievementPlayers,
    stats: AchievementStats,
    address: string,
  ): Achievements {
    const achievements: Achievements = {};
    Object.keys(trophies).forEach((game) => {
      const gameAchievements: Item[] = Object.values(trophies[game]).map(
        (trophy: Trophy) => {
          const formattedAddress = `0x${BigInt(address).toString(16)}`;
          const achievement = data[game]?.[formattedAddress]?.[trophy.id] || {};
          const completion =
            Object.values(achievement).length > 0 &&
            Object.values(achievement).every((task) => task.completion);
          const timestamp = Math.max(
            ...Object.values(achievement).map((task) => task.timestamp),
          );
          // Compute percentage of players who completed the achievement
          const percentage = (
            players[game]?.length
              ? (100 * (stats[game][trophy.id] ?? 0)) / players[game]?.length
              : 0
          ).toFixed(0);
          const tasks: ItemTask[] = trophy.tasks.map((task) => {
            return { ...task, count: achievement[task.id]?.count || 0 };
          });
          return {
            id: trophy.id,
            hidden: trophy.hidden,
            index: trophy.index,
            earning: trophy.earning,
            group: trophy.group,
            icon: trophy.icon,
            title: trophy.title,
            description: trophy.description,
            completed: completion,
            percentage,
            timestamp,
            pinned: false,
            tasks,
          };
        },
      );
      achievements[game] = gameAchievements
        .sort((a, b) => a.index - b.index) // Lowest index to greatest
        .sort((a, b) => (a.id > b.id ? 1 : -1)) // A to Z
        .sort((a, b) => (b.hidden ? -1 : 1) - (a.hidden ? -1 : 1)) // Visible to hidden
        .sort((a, b) => b.timestamp - a.timestamp) // Newest to oldest
        .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0)); // Completed to uncompleted
    });
    return achievements;
  },
};
