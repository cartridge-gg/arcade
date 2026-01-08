import { shortString } from "starknet";
import type { AchievementsPage } from "@dojoengine/grpc";

type GrpcAchievement = AchievementsPage["items"][number];
type GrpcAchievementTask = GrpcAchievement["tasks"][number];

export interface RawTrophy {
  id: string;
  hidden: number;
  page: number;
  points: number;
  start: string;
  end: string;
  achievementGroup: string;
  icon: string;
  title: string;
  description: string;
  taskId: string;
  taskTotal: number;
  taskDescription: string;
  data: string;
}

export interface Task {
  id: string;
  total: number;
  description: string;
}

export class Trophy {
  key: string;
  id: string;
  hidden: boolean;
  index: number;
  earning: number;
  start: number;
  end: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  tasks: Task[];
  data: string;

  constructor(
    key: string,
    id: string,
    hidden: boolean,
    index: number,
    earning: number,
    start: number,
    end: number,
    group: string,
    icon: string,
    title: string,
    description: string,
    tasks: Task[],
    data: string,
  ) {
    this.key = key;
    this.id = id;
    this.hidden = hidden;
    this.index = index;
    this.earning = earning;
    this.start = start;
    this.end = end;
    this.group = group;
    this.icon = icon;
    this.title = title;
    this.description = description;
    this.tasks = tasks;
    this.data = data;
  }

  static from(node: RawTrophy): Trophy {
    return Trophy.parse(node);
  }

  static parse(node: RawTrophy): Trophy {
    return {
      key: `${node.id}-${node.taskId}`,
      id: node.id,
      hidden: node.hidden === 1,
      index: node.page,
      earning: node.points,
      start: node.start === "0x" ? 0 : Number.parseInt(node.start),
      end: node.end === "0x" ? 0 : Number.parseInt(node.end),
      group: shortString.decodeShortString(node.achievementGroup),
      icon: shortString.decodeShortString(node.icon),
      title: shortString.decodeShortString(node.title),
      description: node.description,
      tasks: [
        {
          id: node.taskId,
          total: node.taskTotal,
          description: node.taskDescription,
        },
      ],
      data: node.data,
    };
  }

  static fromGrpc(achievement: GrpcAchievement): Trophy {
    const tasks: Task[] = achievement.tasks.map(
      (task: GrpcAchievementTask) => ({
        id: task.task_id,
        total: task.total,
        description: task.description,
      }),
    );

    const firstTaskId = tasks[0]?.id ?? "";

    return {
      key: `${achievement.id}-${firstTaskId}`,
      id: achievement.id,
      hidden: achievement.hidden,
      index: achievement.index,
      earning: achievement.points,
      start:
        achievement.start === "0" ? 0 : Number.parseInt(achievement.start, 10),
      end: achievement.end === "0" ? 0 : Number.parseInt(achievement.end, 10),
      group: achievement.group,
      icon: achievement.icon,
      title: achievement.title,
      description: achievement.description,
      tasks,
      data: achievement.data ?? "",
    };
  }
}
