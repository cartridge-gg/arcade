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

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.score, 20);
    assert_eq!(item.time, 200);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
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
    assert_eq!(item.key, 2);
    assert_eq!(item.score, 20);
    assert_eq!(item.time, 200);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
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

    // [Assert] Rank 0
    let item = systems.ranker.at(LEADERBOARD_ID, 0).unwrap();
    assert_eq!(item.key, 1);
    assert_eq!(item.time, 100);

    // [Assert] Rank 1
    let item = systems.ranker.at(LEADERBOARD_ID, 1).unwrap();
    assert_eq!(item.key, 2);
    assert_eq!(item.time, 200);
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
}
