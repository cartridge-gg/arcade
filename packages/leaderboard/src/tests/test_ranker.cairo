use crate::tests::mocks::ranker::IRankerDispatcherTrait;
use crate::tests::setup::setup::spawn_game;

// Constants

const LEADERBOARD_ID: felt252 = 'LEADERBOARD';
const GAME_ID: u64 = 1;
const SCORE: u64 = 100;
const TIME: u64 = 1000;

#[test]
fn test_ranker_submission() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: GAME_ID,
            player_id: context.player_id,
            score: SCORE,
            time: TIME,
            to_store: true,
        );
}

#[test]
fn test_ranker_at_direct_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 10,
            time: 100,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 20,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 30,
            time: 300,
            to_store: true,
        );

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.score, 30);
    assert_eq!(item.time, 300);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.score, 20);
    assert_eq!(item.time, 200);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 1);
    assert_eq!(item.score, 10);
    assert_eq!(item.time, 100);
}

#[test]
fn test_ranker_at_indirect_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 30,
            time: 300,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 20,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 10,
            time: 100,
            to_store: true,
        );

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.score, 30);
    assert_eq!(item.time, 300);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.score, 20);
    assert_eq!(item.time, 200);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 1);
    assert_eq!(item.score, 10);
    assert_eq!(item.time, 100);
}

#[test]
fn test_ranker_at_equal_scores_direct_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 42,
            time: 100,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 42,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 42,
            time: 300,
            to_store: true,
        );

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 1);
    assert_eq!(item.time, 100);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.time, 200);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.time, 300);
}

#[test]
fn test_ranker_at_equal_scores_indirect_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 42,
            time: 300,
            to_store: true,
        );

    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 42,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 42,
            time: 100,
            to_store: true,
        );

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 1);
    assert_eq!(item.time, 100);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.time, 200);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.time, 300);
}

#[test]
fn test_ranker_with_capacity_direct_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();
    systems.ranker.set(LEADERBOARD_ID, 3);

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 10,
            time: 100,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 20,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 30,
            time: 300,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 4,
            player_id: context.player_id,
            score: 40,
            time: 400,
            to_store: true,
        );

    // [Assert] Leaderboard length
    assert_eq!(systems.ranker.len(LEADERBOARD_ID), 3);

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 4);
    assert_eq!(item.time, 400);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.time, 300);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.time, 200);

    if let Option::Some(_item) = systems.ranker.at(LEADERBOARD_ID, 3) {
        assert(false, 'Rank 2 should be empty')
    };
}

#[test]
fn test_ranker_with_capacity_indirect_order() {
    // [Setup] World
    let (_world, systems, context) = spawn_game();
    systems.ranker.set(LEADERBOARD_ID, 3);

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 4,
            player_id: context.player_id,
            score: 40,
            time: 400,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 3,
            player_id: context.player_id,
            score: 30,
            time: 300,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 2,
            player_id: context.player_id,
            score: 20,
            time: 200,
            to_store: true,
        );

    // [Submit] Score
    systems
        .ranker
        .submit(
            leaderboard_id: LEADERBOARD_ID,
            game_id: 1,
            player_id: context.player_id,
            score: 10,
            time: 100,
            to_store: true,
        );

    // [Assert] Leaderboard length
    assert_eq!(systems.ranker.len(LEADERBOARD_ID), 3);

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 4);
    assert_eq!(item.time, 400);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 3);
    assert_eq!(item.time, 300);

    // [Assert] Rank 2
    let item = systems.ranker.at(LEADERBOARD_ID, 2).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.time, 200);

    if let Option::Some(_item) = systems.ranker.at(LEADERBOARD_ID, 3) {
        assert(false, 'Rank 2 should be empty')
    };
}
