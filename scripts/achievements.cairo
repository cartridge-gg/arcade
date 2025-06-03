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
    pub const SIMPLE: felt252 = 'SIMPLE';
    pub const COMP_A: felt252 = 'COMP_A';
    pub const COMP_B: felt252 = 'COMP_B';
    pub const HIDDEN: felt252 = 'HIDDEN';
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
        let mut achievements: Array<Achievement> = array![
            Self::simple_1(), Self::simple_2(), Self::simple_3(), Self::composite(), Self::hidden(),
        ];
        while let Option::Some(achievement) = achievements.pop_front() {
            achievement.declare(world);
        }
    }

    fn progress(world: WorldStorage, player_id: felt252, task_id: felt252, count: u128, time: u64) {
        let store: Store = StoreTrait::new(world);
        store.progress(player_id: player_id, task_id: task_id, count: count, time: time)
    }


    #[inline]
    fn simple_1() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            AchievementTaskTrait::new(
                id: Tasks::SIMPLE, total: 10, description: "Do simple 10 times",
            ),
        ];
        Achievement {
            id: 'SIMPLE_1',
            hidden: false,
            index: 0,
            points: 10,
            group: 'Simple',
            icon: 'fa-simple-1',
            title: 'Simple level 1',
            description: "Description for simple_1",
            tasks: tasks.span(),
        }
    }


    #[inline]
    fn simple_2() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            AchievementTaskTrait::new(
                id: Tasks::SIMPLE, total: 20, description: "Do simple 20 times",
            ),
        ];
        Achievement {
            id: 'SIMPLE_2',
            hidden: false,
            index: 1,
            points: 20,
            group: 'Simple',
            icon: 'fa-simple-2',
            title: 'Simple level 2',
            description: "Description for simple_2",
            tasks: tasks.span(),
        }
    }


    #[inline]
    fn simple_3() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            AchievementTaskTrait::new(
                id: Tasks::SIMPLE, total: 50, description: "Do simple 50 times",
            ),
        ];
        Achievement {
            id: 'SIMPLE_3',
            hidden: false,
            index: 2,
            points: 50,
            group: 'Simple',
            icon: 'fa-simple-3',
            title: 'Simple level 3',
            description: "Description for simple_3",
            tasks: tasks.span(),
        }
    }


    #[inline]
    fn composite() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            AchievementTaskTrait::new(id: Tasks::COMP_A, total: 1, description: "Do A 1 time"),
            AchievementTaskTrait::new(id: Tasks::COMP_B, total: 5, description: "Do B 5 times"),
        ];
        Achievement {
            id: 'COMPOSITE',
            hidden: false,
            index: 0,
            points: 100,
            group: 'Composite',
            icon: 'fa-composite',
            title: 'Composite',
            description: "Description for composite",
            tasks: tasks.span(),
        }
    }


    #[inline]
    fn hidden() -> Achievement {
        let tasks: Array<AchievementTask> = array![
            AchievementTaskTrait::new(id: Tasks::HIDDEN, total: 1, description: "Do hidden"),
        ];
        Achievement {
            id: 'HIDDEN',
            hidden: true,
            index: 0,
            points: 69,
            group: 'Hidden',
            icon: 'fa-hidden',
            title: 'Hidden',
            description: "Description for hidden",
            tasks: tasks.span(),
        }
    }
}
