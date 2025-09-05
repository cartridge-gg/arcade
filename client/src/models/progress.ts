export interface RawProgress {
  achievementId: string;
  playerId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  completionTime: number;
  edition: string;
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
  edition: string;

  constructor(
    key: string,
    achievementId: string,
    playerId: string,
    points: number,
    taskId: string,
    taskTotal: number,
    total: number,
    timestamp: number,
    edition: string,
  ) {
    this.key = key;
    this.achievementId = achievementId;
    this.playerId = playerId;
    this.points = points;
    this.taskId = taskId;
    this.taskTotal = taskTotal;
    this.total = total;
    this.timestamp = timestamp;
    this.edition = edition
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
      edition: node.edition,
    };
  }
}
