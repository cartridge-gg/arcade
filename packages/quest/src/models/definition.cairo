use starknet::ContractAddress;
pub use crate::models::index::QuestDefinition;
use crate::types::task::Task;

// Errors

pub mod errors {
    pub const DEFINITION_NOT_ACTIVE: felt252 = 'Quest: not active';
    pub const DEFINITION_INVALID_ID: felt252 = 'Quest: invalid id';
    pub const DEFINITION_INVALID_VERIFIER: felt252 = 'Quest: invalid verifier';
    pub const DEFINITION_INVALID_TASKS: felt252 = 'Quest: invalid tasks';
    pub const DEFINITION_INVALID_DURATION: felt252 = 'Quest: invalid duration';
    pub const DEFINITION_NOT_EXIST: felt252 = 'Quest: does not exist';
}

#[generate_trait]
pub impl DefinitionImpl of DefinitionTrait {
    #[inline]
    fn new(
        id: felt252,
        rewarder: ContractAddress,
        start: u64,
        end: u64,
        duration: u64,
        interval: u64,
        tasks: Span<Task>,
        conditions: Span<felt252>,
        metadata: ByteArray,
    ) -> QuestDefinition {
        // [Check] Inputs
        DefinitionAssert::assert_valid_id(id);
        DefinitionAssert::assert_valid_verifier(rewarder);
        DefinitionAssert::assert_valid_tasks(tasks);
        DefinitionAssert::assert_valid_duration(start, end);
        // [Return] QuestDefinition
        QuestDefinition {
            id: id,
            rewarder: rewarder,
            start: start,
            end: end,
            duration: duration,
            interval: interval,
            tasks: tasks,
            conditions: conditions,
            metadata: metadata,
        }
    }

    #[inline]
    fn update(
        ref self: QuestDefinition,
        rewarder: Option<ContractAddress>,
        start: Option<u64>,
        end: Option<u64>,
        duration: Option<u64>,
        interval: Option<u64>,
        tasks: Option<Span<Task>>,
        metadata: Option<ByteArray>,
    ) {
        self.rewarder = rewarder.unwrap_or(self.rewarder);
        self.start = start.unwrap_or(self.start);
        self.end = end.unwrap_or(self.end);
        self.duration = duration.unwrap_or(self.duration);
        self.interval = interval.unwrap_or(self.interval);
        self.tasks = tasks.unwrap_or(self.tasks);
        self.metadata = metadata.unwrap_or(self.metadata);
    }

    #[inline]
    fn nullify(ref self: QuestDefinition) {
        self.rewarder = 0.try_into().unwrap();
        self.start = 0;
        self.end = 0;
        self.duration = 0;
        self.interval = 0;
        self.tasks = array![].span();
        self.conditions = array![].span();
        self.metadata = Default::default();
    }

    #[inline]
    fn is_active(self: @QuestDefinition, time: u64) -> bool {
        if (time < *self.start || (time >= *self.end && *self.end != 0)) {
            return false;
        }
        if (*self.interval == 0) {
            return true;
        }
        (time - *self.start) % *self.interval < *self.duration
    }

    #[inline]
    fn compute_interval_id(self: @QuestDefinition, time: u64) -> u64 {
        // [Check] Quest is active
        assert(self.is_active(time), errors::DEFINITION_NOT_ACTIVE);
        // [Return] Interval ID
        if (*self.interval == 0) {
            return 0;
        }
        (time - *self.start) / *self.interval
    }
}

#[generate_trait]
pub impl DefinitionAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::DEFINITION_INVALID_ID);
    }

    #[inline]
    fn assert_valid_verifier(verifier: ContractAddress) {
        assert(verifier != 0.try_into().unwrap(), errors::DEFINITION_INVALID_VERIFIER);
    }

    #[inline]
    fn assert_valid_tasks(tasks: Span<Task>) {
        assert(tasks.len() > 0, errors::DEFINITION_INVALID_TASKS);
    }

    #[inline]
    fn assert_valid_duration(start: u64, end: u64) {
        assert(end >= start || end == 0, errors::DEFINITION_INVALID_DURATION);
    }

    #[inline]
    fn assert_does_exist(self: @QuestDefinition) {
        assert(self.tasks.len() > 0, errors::DEFINITION_NOT_EXIST);
    }
}

#[cfg(test)]
mod tests {
    use crate::types::task::{Task, TaskTrait};
    use super::*;

    // Constants

    const QUEST_ID: felt252 = 'QUEST';
    const ONE_DAY: u64 = 24 * 60 * 60;
    const ONE_WEEK: u64 = 7 * ONE_DAY;
    const START: u64 = 4 * ONE_WEEK; // 4 weeks
    const END: u64 = 48 * ONE_WEEK; // 48 weeks
    const DURATION: u64 = 1 * ONE_DAY; // 1 day
    const INTERVAL: u64 = 1 * ONE_WEEK; // 1 week
    const TASK_ID: felt252 = 'TASK';
    const TOTAL: u128 = 100;

    fn IMPLEMENTATION() -> starknet::ContractAddress {
        'IMPLEMENTATION'.try_into().unwrap()
    }

    fn REWARDER() -> starknet::ContractAddress {
        'REWARDER'.try_into().unwrap()
    }

    fn TASKS() -> Span<Task> {
        array![TaskTrait::new(TASK_ID, TOTAL, "TASK DESCRIPTION")].span()
    }

    fn CONDITIONS() -> Span<felt252> {
        array![QUEST_ID].span()
    }

    fn METADATA() -> ByteArray {
        "METADATA"
    }

    #[test]
    fn test_quest_definition_new() {
        let quest = DefinitionTrait::new(
            QUEST_ID, REWARDER(), START, END, DURATION, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.id, QUEST_ID);
        assert_eq!(quest.rewarder, REWARDER());
        assert_eq!(quest.start, START);
        assert_eq!(quest.end, END);
        assert_eq!(quest.duration, DURATION);
        assert_eq!(quest.interval, INTERVAL);
        assert_eq!(quest.tasks.len(), TASKS().len());
        assert_eq!(quest.metadata, METADATA());
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid id',))]
    fn test_quest_definition_new_invalid_id() {
        DefinitionTrait::new(
            0, REWARDER(), START, END, DURATION, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid verifier',))]
    fn test_quest_definition_new_invalid_verifier() {
        DefinitionTrait::new(
            QUEST_ID,
            0.try_into().unwrap(),
            START,
            END,
            DURATION,
            INTERVAL,
            TASKS(),
            CONDITIONS(),
            METADATA(),
        );
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid tasks',))]
    fn test_quest_definition_new_invalid_tasks() {
        DefinitionTrait::new(
            QUEST_ID,
            REWARDER(),
            START,
            END,
            DURATION,
            INTERVAL,
            array![].span(),
            CONDITIONS(),
            METADATA(),
        );
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid duration',))]
    fn test_quest_definition_new_invalid_duration() {
        DefinitionTrait::new(
            QUEST_ID, REWARDER(), START, 1, DURATION, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
    }

    #[test]
    fn test_quest_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID,
            IMPLEMENTATION(),
            START,
            END,
            DURATION,
            INTERVAL,
            TASKS(),
            CONDITIONS(),
            METADATA(),
        );
        assert_eq!(quest.compute_interval_id(START), 0);
        assert_eq!(quest.compute_interval_id(START + DURATION - 1), 0);
        assert_eq!(quest.compute_interval_id(START + INTERVAL), 1);
    }

    #[test]
    fn test_quest_compute_interval_id_no_start() {
        let quest = DefinitionTrait::new(
            QUEST_ID,
            IMPLEMENTATION(),
            0,
            END,
            DURATION,
            INTERVAL,
            TASKS(),
            CONDITIONS(),
            METADATA(),
        );
        assert_eq!(quest.compute_interval_id(0), 0);
        assert_eq!(quest.compute_interval_id(DURATION - 1), 0);
        assert_eq!(quest.compute_interval_id(INTERVAL), 1);
    }

    #[test]
    fn test_quest_compute_interval_id_no_end() {
        let quest = DefinitionTrait::new(
            QUEST_ID,
            IMPLEMENTATION(),
            START,
            0,
            DURATION,
            INTERVAL,
            TASKS(),
            CONDITIONS(),
            METADATA(),
        );
        assert_eq!(quest.compute_interval_id(START), 0);
        assert_eq!(quest.compute_interval_id(START + DURATION - 1), 0);
        assert_eq!(quest.compute_interval_id(START + INTERVAL), 1);
        assert_eq!(
            quest.compute_interval_id(END), quest.compute_interval_id(END - INTERVAL + 1) + 1,
        );
    }

    #[test]
    fn test_quest_compute_interval_id_permanent() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, END, DURATION, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(START), 0);
        assert_eq!(quest.compute_interval_id(START + DURATION - 1), 0);
        assert_eq!(quest.compute_interval_id(START + DURATION), 0);
        assert_eq!(quest.compute_interval_id(START + INTERVAL), 0);
        assert_eq!(quest.compute_interval_id(START + INTERVAL + DURATION), 0);
        assert_eq!(quest.compute_interval_id(END - 1), 0);
        assert_eq!(quest.is_active(END), false);
    }

    #[test]
    fn test_quest_compute_interval_id_no_duration() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, END, 0, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), false);
        assert_eq!(quest.is_active(START), false);
        assert_eq!(quest.is_active(START + DURATION - 1), false);
        assert_eq!(quest.is_active(START + DURATION), false);
        assert_eq!(quest.is_active(START + INTERVAL), false);
        assert_eq!(quest.is_active(START + INTERVAL + DURATION), false);
        assert_eq!(quest.is_active(END), false);
    }

    #[test]
    fn test_quest_compute_interval_id_default() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, 0, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(0), 0);
        assert_eq!(quest.compute_interval_id(DURATION - 1), 0);
        assert_eq!(quest.compute_interval_id(DURATION), 0);
        assert_eq!(quest.compute_interval_id(INTERVAL), 0);
        assert_eq!(quest.compute_interval_id(INTERVAL + DURATION), 0);
        assert_eq!(quest.compute_interval_id(END), 0);
    }
}
