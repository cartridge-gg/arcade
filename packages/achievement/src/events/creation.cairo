// Internal imports

pub use achievement::events::index::TrophyCreation;
use achievement::types::task::Task;

// Constants

const MAX_POINTS: u16 = 100;

// Errors

pub mod errors {
    pub const CREATION_INVALID_ID: felt252 = 'Creation: invalid id';
    pub const CREATION_INVALID_TITLE: felt252 = 'Creation: invalid title';
    pub const CREATION_INVALID_DESCRIPTION: felt252 = 'Creation: invalid desc.';
    pub const CREATION_INVALID_TASKS: felt252 = 'Creation: invalid tasks';
    pub const CREATION_INVALID_DURATION: felt252 = 'Creation: invalid duration';
    pub const CREATION_INVALID_POINTS: felt252 = 'Creation: too much points';
}

// Implementations

#[generate_trait]
pub impl CreationImpl of CreationTrait {
    #[inline]
    fn new(
        id: felt252,
        hidden: bool,
        index: u8,
        points: u16,
        start: u64,
        end: u64,
        group: felt252,
        icon: felt252,
        title: felt252,
        description: ByteArray,
        tasks: Span<Task>,
        data: ByteArray,
    ) -> TrophyCreation {
        // [Check] Inputs
        // [Info] We don't check points here, leave free the game to decide
        CreationAssert::assert_valid_id(id);
        CreationAssert::assert_valid_title(title);
        CreationAssert::assert_valid_description(@description);
        CreationAssert::assert_valid_duration(start, end);
        CreationAssert::assert_valid_points(points);
        // [Return] TrophyCreation
        TrophyCreation {
            id, hidden, index, points, start, end, group, icon, title, description, tasks, data,
        }
    }
}

#[generate_trait]
impl CreationAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::CREATION_INVALID_ID);
    }

    #[inline]
    fn assert_valid_title(title: felt252) {
        assert(title != 0, errors::CREATION_INVALID_TITLE);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, errors::CREATION_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_tasks(tasks: Span<Task>) {
        assert(tasks.len() > 0, errors::CREATION_INVALID_TASKS);
    }

    #[inline]
    fn assert_valid_duration(start: u64, end: u64) {
        assert(end >= start, errors::CREATION_INVALID_DURATION);
    }

    #[inline]
    fn assert_valid_points(points: u16) {
        assert(points <= MAX_POINTS, errors::CREATION_INVALID_POINTS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use achievement::types::task::{Task, TaskTrait};
    use super::{CreationTrait, MAX_POINTS};

    // Constants

    const ID: felt252 = 'CREATION';
    const INDEX: u8 = 0;
    const GROUP: felt252 = 'GROUP';
    const HIDDEN: bool = false;
    const POINTS: u16 = 100;
    const TOTAL: u128 = 100;
    const TITLE: felt252 = 'TITLE';
    const ICON: felt252 = 'ICON';
    const TASK_ID: felt252 = 'TASK';
    const START: u64 = 100;
    const END: u64 = 200;

    #[test]
    fn test_achievement_creation_new() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        let achievement = CreationTrait::new(
            ID,
            HIDDEN,
            INDEX,
            POINTS,
            START,
            END,
            GROUP,
            ICON,
            TITLE,
            "DESCRIPTION",
            tasks.span(),
            "DATA",
        );
        assert(achievement.id == ID, 'Invalid ID');
        assert(achievement.hidden == HIDDEN, 'Invalid hidden');
        assert(achievement.index == INDEX, 'Invalid index');
        assert(achievement.points == POINTS, 'Invalid points');
        assert(achievement.start == START, 'Invalid start');
        assert(achievement.end == END, 'Invalid end');
        assert(achievement.group == GROUP, 'Invalid group');
        assert(achievement.icon == ICON, 'Invalid icon');
        assert(achievement.title == TITLE, 'Invalid title');
        assert(achievement.description == "DESCRIPTION", 'Invalid description');
        assert(achievement.tasks.len() == 1, 'Invalid tasks');
        assert(achievement.data == "DATA", 'Invalid data');
    }

    #[test]
    #[should_panic(expected: ('Creation: invalid id',))]
    fn test_achievement_creation_new_invalid_id() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        CreationTrait::new(
            0,
            HIDDEN,
            INDEX,
            POINTS,
            START,
            END,
            GROUP,
            ICON,
            TITLE,
            "DESCRIPTION",
            tasks.span(),
            "",
        );
    }

    #[test]
    #[should_panic(expected: ('Creation: invalid title',))]
    fn test_achievement_creation_new_invalid_title() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        CreationTrait::new(
            ID, HIDDEN, INDEX, POINTS, START, END, GROUP, ICON, 0, "DESCRIPTION", tasks.span(), "",
        );
    }

    #[test]
    #[should_panic(expected: ('Creation: invalid desc.',))]
    fn test_achievement_creation_new_invalid_description() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        CreationTrait::new(
            ID, HIDDEN, INDEX, POINTS, START, END, GROUP, ICON, TITLE, "", tasks.span(), "",
        );
    }

    #[test]
    #[should_panic(expected: ('Creation: invalid duration',))]
    fn test_achievement_creation_new_invalid_duration() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        CreationTrait::new(
            ID,
            HIDDEN,
            INDEX,
            POINTS,
            START,
            0,
            GROUP,
            ICON,
            TITLE,
            "DESCRIPTION",
            tasks.span(),
            "",
        );
    }

    #[test]
    #[should_panic(expected: ('Creation: too much points',))]
    fn test_achievement_creation_new_invalid_points() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")];
        CreationTrait::new(
            ID,
            HIDDEN,
            INDEX,
            MAX_POINTS + 1,
            START,
            END,
            GROUP,
            ICON,
            TITLE,
            "DESCRIPTION",
            tasks.span(),
            "",
        );
    }
}

