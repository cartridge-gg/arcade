#!/usr/bin/env tsx

import { constantCase, snakeCase } from "change-case";
import path from "node:path";
import fs from "node:fs";
import csv from "csv-parser";

type Task = {
  id: string;
  total: number;
  description: string;
};

type Achievement = {
  id: string;
  group: string;
  index: number;
  title: string;
  description: string;
  points: number;
  icon: string;
  hidden: boolean;
  tasks: Task[];
};

const readCsv = async (path: string): Promise<any[]> => {
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csv({separator:";"}))
      .on("data", (data: any) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
};

const parseTask = (line: any) => {
  const splitted = line.split(":");
  return {
    id: splitted[0],
    total: Number(splitted[1]),
    description: splitted[2],
  };
};

const parseAchievement = (line: any) => {
  return {
    id: line.id,
    group: line.group,
    index: Number(line.index),
    title: line.title,
    description: line.description,
    points: Number(line.points),
    icon: line.icon,
    hidden: Boolean(Number(line.hidden)),
    tasks: line.tasks.split("\n").map(parseTask),
  };
};

const getUniqueTasksIds = (achievements: Achievement[]) => {
  const all = achievements.flatMap((a) => {
    return a.tasks.map((t) => t.id);
  });

  return Array.from(new Set(all));
};

const genTasks = (uniqueTasksIds) => {
  return uniqueTasksIds
    .map((id) => {
      return `pub const ${constantCase(id)}: felt252 = '${constantCase(id)}';`;
    })
    .join("\n");
};

const genAchievementsDeclaration = (achievements: Achievement[]) => {
  return achievements
    .map((a) => {
      return `Self::${snakeCase(a.id)}(),`;
    })
    .join("\n");
};

const genAchievements = (achievements: Achievement[]) => {
  return achievements
    .map((a) => {
      return `
      #[inline]
    fn ${snakeCase(a.id)}() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            ${a.tasks.map((t) => `AchievementTaskTrait::new( id: Tasks::${constantCase(t.id)}, total: ${t.total}, description: "${t.description}", ),`).join("\n")}
        ];
        Achievement {
            id: '${constantCase(a.id)}',
            hidden: ${a.hidden ? "true" : "false"},
            index: ${a.index},
            points: ${a.points},
            group: '${a.group}',
            icon: '${a.icon}',
            title: '${a.title}',
            description: "${a.description}",
            tasks: tasks.span(),
        }
    }
      `;
    })
    .join("\n");
};

const template = (tasksIds, achievementsDeclaration, achievements) => {
  return `
use achievement::store::{Store, StoreTrait};
use achievement::types::task::{Task as AchievementTask, TaskTrait as AchievementTaskTrait};
use dojo::world::WorldStorage;

#[derive(Drop)]
pub struct Achievement {
    pub id: felt252, // Unique identifier for the achievement
    pub hidden: bool, // Hidden status of the achievement
    pub index: u8, // The page of the achievement in the group
    pub points: u16, // Weight of the achievement
    pub group: felt252, // Group name header to aggregate achievements
    pub icon: felt252, // https://fontawesome.com/search?o=r&s=solid
    pub title: felt252, // Title of the achievement
    pub description: ByteArray, // Description of the achievement (not the task itself)
    pub tasks: Span<AchievementTask> // Array of tasks to complete to unlock the achievement
}

pub mod Tasks {
    ${tasksIds}
}

#[generate_trait]
pub impl AchievementImpl of AchievementTrait {
    #[inline]
    fn declare(self: Achievement, mut world: WorldStorage) {
        let store: Store = StoreTrait::new(world);
        store
            .create(
                id: self.id,
                hidden: self.hidden,
                index: self.index,
                points: self.points,
                start: 0,
                end: 0,
                group: self.group,
                icon: self.icon,
                title: self.title,
                description: self.description.clone(),
                tasks: self.tasks,
                data: "",
            );
    }

    fn declare_all(mut world: WorldStorage) {
        let mut achievements: Array<Achievement> = array![${achievementsDeclaration}];
        while let Option::Some(achievement) = achievements.pop_front() {
            achievement.declare(world);
        }
    }

    fn progress(world: WorldStorage, player_id: felt252, task_id: felt252, count: u128, time: u64) {
        let store: Store = StoreTrait::new(world);
        store.progress(player_id: player_id, task_id: task_id, count: count, time: time)
    }

    ${achievements}
}
`;
};

const main = async () => {
  const commandPath = path.dirname(process.argv[1]);
  const csvPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!csvPath || !outputPath) {
    return console.log(`Usage: npx gen [file.csv] [outputPath]
ex: npx gen ./scripts/achievements.csv ./scripts/achievements.cairo`);
  }

  const content = await readCsv(csvPath);
  const parsed = content.map(parseAchievement);
  const uniqueTasksIds = getUniqueTasksIds(parsed);

  const generated = template(
    genTasks(uniqueTasksIds),
    genAchievementsDeclaration(parsed),
    genAchievements(parsed)
  );

  console.log(generated);

  fs.writeFileSync(outputPath, generated);

  console.log("Done.");
};

main();
