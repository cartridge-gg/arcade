// Internal imports

use arcade_trophy::events::index::TrophyCreation;
use arcade_trophy::types::task::{Task, TaskTrait};

// Errors

pub mod errors {
    pub const TROPHY_INVALID_ID: felt252 = 'Trophy: invalid id';
    pub const TROPHY_INVALID_TITLE: felt252 = 'Trophy: invalid title';
    pub const TROPHY_INVALID_DESCRIPTION: felt252 = 'Trophy: invalid desc.';
    pub const TROPHY_INVALID_TASKS: felt252 = 'Trophy: invalid tasks.';
    pub const TROPHY_INVALID_DURATION: felt252 = 'Trophy: invalid duration.';
}

// Implementations

#[generate_trait]
impl TrophyImpl of TrophyTrait {
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
        TrophyAssert::assert_valid_id(id);
        TrophyAssert::assert_valid_title(title);
        TrophyAssert::assert_valid_description(@description);
        TrophyAssert::assert_valid_duration(start, end);
        // [Return] TrophyCreation
        TrophyCreation {
            id, hidden, index, points, start, end, group, icon, title, description, tasks, data
        }
    }
}

#[generate_trait]
impl TrophyAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::TROPHY_INVALID_ID);
    }

    #[inline]
    fn assert_valid_title(title: felt252) {
        assert(title != 0, errors::TROPHY_INVALID_TITLE);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, errors::TROPHY_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_tasks(tasks: Span<Task>) {
        assert(tasks.len() > 0, errors::TROPHY_INVALID_TASKS);
    }

    #[inline]
    fn assert_valid_duration(start: u64, end: u64) {
        assert(end >= start, errors::TROPHY_INVALID_DURATION);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::TrophyTrait;
    use super::{Task, TaskTrait};

    // Constants

    const ID: felt252 = 'TROPHY';
    const INDEX: u8 = 0;
    const GROUP: felt252 = 'GROUP';
    const HIDDEN: bool = false;
    const POINTS: u16 = 100;
    const TOTAL: u32 = 100;
    const TITLE: felt252 = 'TITLE';
    const ICON: felt252 = 'ICON';
    const TASK_ID: felt252 = 'TASK';
    const START: u64 = 100;
    const END: u64 = 200;

    #[test]
    fn test_achievement_creation_new() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION"),];
        let achievement = TrophyTrait::new(
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
            "DATA"
        );
        assert_eq!(achievement.id, ID);
        assert_eq!(achievement.hidden, HIDDEN);
        assert_eq!(achievement.index, INDEX);
        assert_eq!(achievement.points, POINTS);
        assert_eq!(achievement.start, START);
        assert_eq!(achievement.end, END);
        assert_eq!(achievement.group, GROUP);
        assert_eq!(achievement.icon, ICON);
        assert_eq!(achievement.title, TITLE);
        assert_eq!(achievement.description, "DESCRIPTION");
        assert_eq!(achievement.tasks.len(), 1);
        assert_eq!(achievement.data, "DATA");
    }

    #[test]
    #[should_panic(expected: ('Trophy: invalid id',))]
    fn test_achievement_creation_new_invalid_id() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION"),];
        TrophyTrait::new(
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
            ""
        );
    }

    #[test]
    #[should_panic(expected: ('Trophy: invalid title',))]
    fn test_achievement_creation_new_invalid_title() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION"),];
        TrophyTrait::new(
            ID, HIDDEN, INDEX, POINTS, START, END, GROUP, ICON, 0, "DESCRIPTION", tasks.span(), ""
        );
    }

    #[test]
    #[should_panic(expected: ('Trophy: invalid desc.',))]
    fn test_achievement_creation_new_invalid_description() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION"),];
        TrophyTrait::new(
            ID, HIDDEN, INDEX, POINTS, START, END, GROUP, ICON, TITLE, "", tasks.span(), ""
        );
    }

    #[test]
    #[should_panic(expected: ('Trophy: invalid duration.',))]
    fn test_achievement_creation_new_invalid_duration() {
        let tasks: Array<Task> = array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION"),];
        TrophyTrait::new(
            ID, HIDDEN, INDEX, POINTS, START, 0, GROUP, ICON, TITLE, "DESCRIPTION", tasks.span(), ""
        );
    }
}

