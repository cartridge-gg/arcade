/**
 * TypeScript types for SSR functionality
 */

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface Project {
  model: string;
  namespace: string;
  project: string;
}

export interface RawProgression {
  playerId: string;
  achievementId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  completionTime: string;
}

export interface PlayerStats {
  totalPoints: number;
  totalCompleted: number;
  totalAchievements: number;
  gameStats: Record<string, {
    points: number;
    completed: number;
    total: number;
  }>;
}
