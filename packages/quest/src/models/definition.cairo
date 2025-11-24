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
    pub const DEFINITION_INVALID_INTERVAL: felt252 = 'Quest: invalid interval';
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
        DefinitionAssert::assert_valid_interval(duration, interval);
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
    fn assert_valid_interval(duration: u64, interval: u64) {
        assert(
            (duration + interval) == 0 || (interval * duration) != 0,
            errors::DEFINITION_INVALID_INTERVAL,
        );
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
    #[should_panic(expected: ('Quest: invalid interval',))]
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

    // Case 1: Permanent quest (start=0, end=0, duration=0, interval=0)
    #[test]
    fn test_permanent_is_active() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, 0, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), true, "Quest should be active at time 0");
        assert_eq!(quest.is_active(1000000), true, "Quest should be active at time 1000000");
        assert_eq!(
            quest.is_active(999999999999), true, "Quest should be active at very far future",
        );
    }

    #[test]
    fn test_permanent_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, 0, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(0), 0, "Interval ID should be 0 at time 0");
        assert_eq!(
            quest.compute_interval_id(1000000), 0, "Interval ID should be 0 at time 1000000",
        );
        assert_eq!(
            quest.compute_interval_id(999999999999),
            0,
            "Interval ID should be 0 at very far future",
        );
    }

    // Case 2: Delayed Permanent quest (start>0, end=0, duration=0, interval=0)
    #[test]
    fn test_delayed_permanent_is_active() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, 0, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), false, "Quest should be inactive before start");
        assert_eq!(quest.is_active(START - 1), false, "Quest should be inactive just before start");
        assert_eq!(quest.is_active(START), true, "Quest should be active at start time");
        assert_eq!(quest.is_active(START + 1), true, "Quest should be active after start");
        assert_eq!(
            quest.is_active(START + 1000000), true, "Quest should be active far after start",
        );
        assert_eq!(
            quest.is_active(999999999999), true, "Quest should be active at very far future",
        );
    }

    #[test]
    fn test_delayed_permanent_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, 0, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(START), 0, "Interval ID should be 0 at start");
        assert_eq!(
            quest.compute_interval_id(START + 1000000), 0, "Interval ID should be 0 after start",
        );
    }

    // Case 3: Time-Limited quest (start=0, end>0, duration=0, interval=0)
    #[test]
    fn test_time_limited_is_active() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, END, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), true, "Quest should be active at time 0");
        assert_eq!(quest.is_active(END - 1), true, "Quest should be active just before end");
        assert_eq!(quest.is_active(END), false, "Quest should be inactive at end time");
        assert_eq!(quest.is_active(END + 1), false, "Quest should be inactive after end");
        assert_eq!(quest.is_active(END + 1000000), false, "Quest should be inactive far after end");
    }

    #[test]
    fn test_time_limited_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, END, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(0), 0, "Interval ID should be 0 at time 0");
        assert_eq!(quest.compute_interval_id(END - 1), 0, "Interval ID should be 0 before end");
    }

    // Case 4: Time-Limited with Delay quest (start>0, end>0, duration=0, interval=0)
    #[test]
    fn test_time_limited_with_delay_is_active() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, END, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), false, "Quest should be inactive before start");
        assert_eq!(quest.is_active(START - 1), false, "Quest should be inactive just before start");
        assert_eq!(quest.is_active(START), true, "Quest should be active at start time");
        assert_eq!(quest.is_active(START + 1), true, "Quest should be active after start");
        assert_eq!(quest.is_active((START + END) / 2), true, "Quest should be active in middle");
        assert_eq!(quest.is_active(END - 1), true, "Quest should be active just before end");
        assert_eq!(quest.is_active(END), false, "Quest should be inactive at end time");
        assert_eq!(quest.is_active(END + 1), false, "Quest should be inactive after end");
    }

    #[test]
    fn test_time_limited_with_delay_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), START, END, 0, 0, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(START), 0, "Interval ID should be 0 at start");
        assert_eq!(quest.compute_interval_id(END - 1), 0, "Interval ID should be 0 before end");
    }

    // Case 5: Recurring Permanent quest (start=0, end=0, duration>0, interval>0)
    #[test]
    fn test_recurring_permanent_is_active() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, 0, DURATION, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.is_active(0), true, "Quest should be active at time 0");
        assert_eq!(
            quest.is_active(DURATION - 1), true, "Quest should be active just before duration ends",
        );
        assert_eq!(quest.is_active(DURATION), false, "Quest should be inactive after duration");
        assert_eq!(
            quest.is_active(INTERVAL - 1), false, "Quest should be inactive just before next cycle",
        );
        assert_eq!(
            quest.is_active(INTERVAL), true, "Quest should be active at start of second cycle",
        );
        assert_eq!(
            quest.is_active(INTERVAL + DURATION - 1),
            true,
            "Quest should be active during second cycle",
        );
        assert_eq!(
            quest.is_active(INTERVAL + DURATION),
            false,
            "Quest should be inactive after second cycle duration",
        );
        assert_eq!(
            quest.is_active(2 * INTERVAL), true, "Quest should be active at start of third cycle",
        );
    }

    #[test]
    fn test_recurring_permanent_compute_interval_id() {
        let quest = DefinitionTrait::new(
            QUEST_ID, IMPLEMENTATION(), 0, 0, DURATION, INTERVAL, TASKS(), CONDITIONS(), METADATA(),
        );
        assert_eq!(quest.compute_interval_id(0), 0, "Interval ID should be 0 at time 0");
        assert_eq!(
            quest.compute_interval_id(DURATION - 1),
            0,
            "Interval ID should be 0 during first cycle",
        );
        assert_eq!(
            quest.compute_interval_id(INTERVAL),
            1,
            "Interval ID should be 1 at start of second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(INTERVAL + DURATION - 1),
            1,
            "Interval ID should be 1 during second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(2 * INTERVAL),
            2,
            "Interval ID should be 2 at start of third cycle",
        );
    }

    // Case 6: Recurring Permanent with Delay quest (start>0, end=0, duration>0, interval>0)
    #[test]
    fn test_recurring_permanent_with_delay_is_active() {
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
        assert_eq!(quest.is_active(0), false, "Quest should be inactive before start");
        assert_eq!(quest.is_active(START - 1), false, "Quest should be inactive just before start");
        assert_eq!(quest.is_active(START), true, "Quest should be active at start time");
        assert_eq!(
            quest.is_active(START + DURATION - 1),
            true,
            "Quest should be active just before duration ends",
        );
        assert_eq!(
            quest.is_active(START + DURATION),
            false,
            "Quest should be inactive after first cycle duration",
        );
        assert_eq!(
            quest.is_active(START + INTERVAL - 1),
            false,
            "Quest should be inactive just before second cycle",
        );
        assert_eq!(
            quest.is_active(START + INTERVAL),
            true,
            "Quest should be active at start of second cycle",
        );
        assert_eq!(
            quest.is_active(START + INTERVAL + DURATION - 1),
            true,
            "Quest should be active during second cycle",
        );
    }

    #[test]
    fn test_recurring_permanent_with_delay_compute_interval_id() {
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
        assert_eq!(quest.compute_interval_id(START), 0, "Interval ID should be 0 at start");
        assert_eq!(
            quest.compute_interval_id(START + DURATION - 1),
            0,
            "Interval ID should be 0 during first cycle",
        );
        assert_eq!(
            quest.compute_interval_id(START + INTERVAL),
            1,
            "Interval ID should be 1 at start of second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(START + INTERVAL + DURATION - 1),
            1,
            "Interval ID should be 1 during second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(START + 2 * INTERVAL),
            2,
            "Interval ID should be 2 at start of third cycle",
        );
    }

    // Case 7: Recurring Time-Limited quest (start=0, end>0, duration>0, interval>0)
    #[test]
    fn test_recurring_time_limited_is_active() {
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
        assert_eq!(quest.is_active(0), true, "Quest should be active at time 0");
        assert_eq!(
            quest.is_active(DURATION - 1), true, "Quest should be active just before duration ends",
        );
        assert_eq!(quest.is_active(DURATION), false, "Quest should be inactive after duration");
        assert_eq!(
            quest.is_active(INTERVAL - 1), false, "Quest should be inactive just before next cycle",
        );
        assert_eq!(
            quest.is_active(INTERVAL), true, "Quest should be active at start of second cycle",
        );
        assert_eq!(quest.is_active(END), false, "Quest should be inactive at end time");
        assert_eq!(quest.is_active(END + 1), false, "Quest should be inactive after end");
    }

    #[test]
    fn test_recurring_time_limited_compute_interval_id() {
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
        assert_eq!(quest.compute_interval_id(0), 0, "Interval ID should be 0 at time 0");
        assert_eq!(
            quest.compute_interval_id(DURATION - 1),
            0,
            "Interval ID should be 0 during first cycle",
        );
        assert_eq!(
            quest.compute_interval_id(INTERVAL),
            1,
            "Interval ID should be 1 at start of second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(INTERVAL + DURATION - 1),
            1,
            "Interval ID should be 1 during second cycle",
        );
    }

    // Case 8: Recurring Time-Limited with Delay quest (start>0, end>0, duration>0, interval>0)
    #[test]
    fn test_recurring_time_limited_with_delay_is_active() {
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
        assert_eq!(quest.is_active(0), false, "Quest should be inactive before start");
        assert_eq!(quest.is_active(START - 1), false, "Quest should be inactive just before start");
        assert_eq!(quest.is_active(START), true, "Quest should be active at start time");
        assert_eq!(
            quest.is_active(START + DURATION - 1),
            true,
            "Quest should be active just before duration ends",
        );
        assert_eq!(
            quest.is_active(START + DURATION),
            false,
            "Quest should be inactive after first cycle duration",
        );
        assert_eq!(
            quest.is_active(START + INTERVAL - 1),
            false,
            "Quest should be inactive just before second cycle",
        );
        assert_eq!(
            quest.is_active(START + INTERVAL),
            true,
            "Quest should be active at start of second cycle",
        );
        assert_eq!(quest.is_active(END), false, "Quest should be inactive at end time");
        assert_eq!(quest.is_active(END + 1), false, "Quest should be inactive after end");
    }

    #[test]
    fn test_recurring_time_limited_with_delay_compute_interval_id() {
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
        assert_eq!(quest.compute_interval_id(START), 0, "Interval ID should be 0 at start");
        assert_eq!(
            quest.compute_interval_id(START + DURATION - 1),
            0,
            "Interval ID should be 0 during first cycle",
        );
        assert_eq!(
            quest.compute_interval_id(START + INTERVAL),
            1,
            "Interval ID should be 1 at start of second cycle",
        );
        assert_eq!(
            quest.compute_interval_id(START + INTERVAL + DURATION - 1),
            1,
            "Interval ID should be 1 during second cycle",
        );
    }
}
