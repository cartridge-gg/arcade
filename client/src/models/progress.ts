import type {
  PlayerAchievementsPage,
  AchievementsPage,
} from "@dojoengine/grpc";

type GrpcPlayerEntry = PlayerAchievementsPage["items"][number];
type GrpcPlayerProgress = GrpcPlayerEntry["achievements"][number];
type GrpcTaskProgress = GrpcPlayerProgress["task_progress"][number];
type GrpcAchievement = AchievementsPage["items"][number];

export interface RawProgress {
  achievementId: string;
  playerId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  completionTime: number;
}

export class Progress {
  key: string;
  achievementId: string;
  playerId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  timestamp: number;

  constructor(
    key: string,
    achievementId: string,
    playerId: string,
    points: number,
    taskId: string,
    taskTotal: number,
    total: number,
    timestamp: number,
  ) {
    this.key = key;
    this.achievementId = achievementId;
    this.playerId = playerId;
    this.points = points;
    this.taskId = taskId;
    this.taskTotal = taskTotal;
    this.total = total;
    this.timestamp = timestamp;
  }

  static from(node: RawProgress): Progress {
    return Progress.parse(node);
  }

  static parse(node: RawProgress): Progress {
    return {
      key: `${node.playerId}-${node.achievementId}-${node.taskId}`,
      achievementId: node.achievementId,
      playerId: node.playerId,
      points: node.points,
      taskId: node.taskId,
      taskTotal: node.taskTotal,
      total: node.total,
      timestamp: new Date(node.completionTime).getTime() / 1000,
    };
  }

  static fromGrpc(
    playerAddress: string,
    achievement: GrpcAchievement,
    taskProgress: GrpcTaskProgress,
    completedAt?: number,
  ): Progress {
    const task = achievement.tasks.find(
      (t) => t.task_id === taskProgress.task_id,
    );

    return {
      key: `${playerAddress}-${achievement.id}-${taskProgress.task_id}`,
      achievementId: achievement.id,
      playerId: playerAddress,
      points: achievement.points,
      taskId: taskProgress.task_id,
      taskTotal: task?.total ?? 0,
      total: taskProgress.count,
      timestamp: completedAt ?? 0,
    };
  }
}
