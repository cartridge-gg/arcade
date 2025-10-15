import { describe, it, expect } from "vitest";
import {
  AchievementHelper,
  type Progressions,
  type Trophies,
} from "@/lib/achievements";
import type { Progress, Trophy } from "@/models";

const SAMPLE_GAME = "arcade";

const createProgress = (overrides: Partial<Progress>): Progress =>
  ({
    key: "player-ach-task",
    achievementId: "ach-1",
    playerId: "0x1",
    points: 100,
    taskId: "task-1",
    taskTotal: 10,
    total: 10,
    timestamp: 1_700_000_000,
    ...overrides,
  }) as Progress;

const createTrophy = (overrides: Partial<Trophy>): Trophy =>
  ({
    key: "ach-1-task-1",
    id: "ach-1",
    hidden: false,
    index: 1,
    earning: 150,
    start: 0,
    end: 0,
    group: "Story",
    icon: "icon.png",
    title: "Champion",
    description: "Win the match",
    tasks: [
      {
        id: "task-1",
        total: 10,
        description: "Complete the tutorial",
      },
    ],
    data: "",
    ...overrides,
  }) as Trophy;

describe("AchievementHelper", () => {
  it("extracts achievement progress data", () => {
    const progressions: Progressions = {
      [SAMPLE_GAME]: {
        "player-ach-task": createProgress({}),
      },
    };

    const trophies: Trophies = {
      [SAMPLE_GAME]: {
        "ach-1": createTrophy({}),
      },
    };

    const result = AchievementHelper.extract(progressions, trophies);

    expect(result[SAMPLE_GAME]["0x1"]["ach-1"]["task-1"]).toMatchObject({
      completion: true,
      count: 10,
      timestamp: 1_700_000_000,
    });
  });

  it("computes player summaries and events", () => {
    const progressions: Progressions = {
      [SAMPLE_GAME]: {
        "player-ach-task": createProgress({}),
      },
    };
    const trophies: Trophies = {
      [SAMPLE_GAME]: {
        "ach-1": createTrophy({}),
      },
    };
    const data = AchievementHelper.extract(progressions, trophies);

    const { stats, players, events, globals } =
      AchievementHelper.computePlayers(data, trophies);

    expect(stats[SAMPLE_GAME]["ach-1"]).toBe(1);
    expect(players[SAMPLE_GAME][0]).toMatchObject({
      address: "0x1",
      earnings: 150,
      completeds: ["ach-1"],
    });
    expect(events[SAMPLE_GAME][0]).toMatchObject({
      achievement: expect.objectContaining({ title: "Champion" }),
      player: "0x1",
    });
    expect(globals[0]).toMatchObject({
      address: "0x1",
      earnings: 150,
    });
  });
});
