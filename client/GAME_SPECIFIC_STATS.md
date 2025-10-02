# Game-Specific Player Stats Guide

## Overview

The implementation automatically computes **per-game statistics** for each player. You can access overall stats (across all games) or game-specific stats (for individual games).

## Data Structure

### Player Stats Object

```typescript
interface PlayerStats {
  address: string;           // Player's Starknet address
  username: string;          // Player's username
  totalPoints: number;       // Total points across ALL games
  totalCompleted: number;    // Total achievements across ALL games
  totalAchievements: number; // Total available achievements across ALL games
  rank?: number;             // Overall rank (optional)
  gameStats: {               // ← Per-game breakdown
    [gameId: string]: GameStats;
  };
}

interface GameStats {
  points: number;      // Points in THIS game only
  completed: number;   // Achievements completed in THIS game
  total: number;       // Total achievements available in THIS game
  rank?: number;       // Rank in THIS game (optional)
}
```

### Example Data

```typescript
{
  address: "0x1234567890abcdef...",
  username: "coolgamer",
  totalPoints: 1250,           // All games combined
  totalCompleted: 15,          // All games combined
  totalAchievements: 50,       // All games combined
  gameStats: {
    "dopewars": {
      points: 500,             // ← JUST dopewars points
      completed: 8,            // ← JUST dopewars achievements
      total: 20
    },
    "loot-survivor": {
      points: 750,             // ← JUST loot-survivor points
      completed: 7,            // ← JUST loot-survivor achievements
      total: 30
    },
    "zkube": {
      points: 0,               // Player hasn't played this yet
      completed: 0,
      total: 25
    }
  }
}
```

## How to Access Game-Specific Stats

### Method 1: Direct Access

```typescript
import { computePlayerStats } from './api/lib/player-stats';

// Compute full player stats
const stats = computePlayerStats(address, username, progressionsData, achievementsData);

// Access specific game stats
const dopeWarsStats = stats.gameStats["dopewars"];
console.log(`Points in DopeWars: ${dopeWarsStats.points}`);
console.log(`Achievements: ${dopeWarsStats.completed}/${dopeWarsStats.total}`);
```

### Method 2: Using Helper Functions

```typescript
import {
  computePlayerStats,
  getGameStats,
  hasPlayedGame,
  formatGameStatsDescription
} from './api/lib/player-stats';

const stats = computePlayerStats(...);

// Check if player has played a game
if (hasPlayedGame(stats, "dopewars")) {
  console.log("Player has played DopeWars!");
}

// Get game-specific stats (returns undefined if not played)
const gameStats = getGameStats(stats, "dopewars");
if (gameStats) {
  console.log(`Points: ${gameStats.points}`);
}

// Format for display
const description = formatGameStatsDescription(gameStats, "dopewars");
// Result: "500 Points • 8/20 Achievements in dopewars"
```

## URL Routes for Game-Specific Pages

### Route Patterns

1. **Overall profile:** `/player/:username`
   - Shows total points across ALL games
   - Example: `/player/coolgamer`

2. **Game-specific profile:** `/game/:gameId/player/:username`
   - Shows points for SPECIFIC game only
   - Example: `/game/dopewars/player/coolgamer`

### How Routing Works

```
Request: /game/dopewars/player/coolgamer
    ↓
vercel.json matches pattern
    ↓
Rewrites to: /api/ssr?path=/game/dopewars/player/coolgamer
    ↓
SSR function parses URL:
  - urlParts[0] = "game"
  - urlParts[1] = "dopewars"
  - urlParts[2] = "player"
  - urlParts[3] = "coolgamer"
    ↓
Fetches player data for ALL games
    ↓
Computes stats including gameStats object
    ↓
Extracts: stats.gameStats["dopewars"]
    ↓
Generates meta tags with game-specific data
```

## SSR Implementation

The SSR endpoint (`api/ssr.ts`) automatically handles game-specific pages:

```typescript
// In generateMetaTags() function

if (urlParts[0] === "game" && urlParts[2] === "player" && urlParts[3]) {
  const gameId = urlParts[1];        // "dopewars"
  const username = urlParts[3];      // "coolgamer"

  // Fetch and compute stats
  const stats = computePlayerStats(...);

  // Extract game-specific stats
  const gameStats = stats.gameStats[gameId];

  if (gameStats) {
    title = `${username} in ${gameId} | Cartridge Arcade`;
    description = `${gameStats.points.toLocaleString()} Points • ${gameStats.completed}/${gameStats.total} Achievements in ${gameId}`;
    imageUrl = `https://api.cartridge.gg/og/game-profile?username=${username}&game=${gameId}&points=${gameStats.points}`;
  }
}
```

## Meta Tags Generated

### Overall Profile: `/player/coolgamer`

```html
<meta property="og:title" content="coolgamer | Cartridge Arcade" />
<meta property="og:description" content="1,250 Points • 15/50 Achievements" />
<meta property="og:image" content="https://api.cartridge.gg/og/profile?username=coolgamer&points=1250&achievements=15/50" />
```

### Game-Specific Profile: `/game/dopewars/player/coolgamer`

```html
<meta property="og:title" content="coolgamer in dopewars | Cartridge Arcade" />
<meta property="og:description" content="500 Points • 8/20 Achievements in dopewars" />
<meta property="og:image" content="https://api.cartridge.gg/og/game-profile?username=coolgamer&game=dopewars&points=500&achievements=8/20" />
```

## Use Cases

### 1. Display Player's Game Portfolio

```typescript
const stats = computePlayerStats(...);

// List all games the player has played
Object.entries(stats.gameStats).forEach(([gameId, gameStats]) => {
  if (gameStats.points > 0) {
    console.log(`${gameId}: ${gameStats.points} points, ${gameStats.completed}/${gameStats.total} achievements`);
  }
});

// Output:
// dopewars: 500 points, 8/20 achievements
// loot-survivor: 750 points, 7/30 achievements
```

### 2. Find Player's Best Game

```typescript
const stats = computePlayerStats(...);

// Find game with most points
const bestGame = Object.entries(stats.gameStats)
  .filter(([_, s]) => s.points > 0)
  .sort((a, b) => b[1].points - a[1].points)[0];

console.log(`Best game: ${bestGame[0]} with ${bestGame[1].points} points`);
// Output: Best game: loot-survivor with 750 points
```

### 3. Calculate Completion Rate per Game

```typescript
const stats = computePlayerStats(...);

Object.entries(stats.gameStats).forEach(([gameId, gameStats]) => {
  const completionRate = (gameStats.completed / gameStats.total) * 100;
  console.log(`${gameId}: ${completionRate.toFixed(1)}% complete`);
});

// Output:
// dopewars: 40.0% complete
// loot-survivor: 23.3% complete
// zkube: 0.0% complete
```

### 4. Generate Game Leaderboard Entry

```typescript
const stats = computePlayerStats(...);
const gameStats = getGameStats(stats, "dopewars");

const leaderboardEntry = {
  username: stats.username,
  address: stats.address,
  points: gameStats.points,
  achievements: `${gameStats.completed}/${gameStats.total}`,
  completionRate: (gameStats.completed / gameStats.total) * 100
};

console.log(leaderboardEntry);
// Output: { username: "coolgamer", points: 500, achievements: "8/20", completionRate: 40 }
```

## GraphQL Query for Game-Specific Data

When you query with the `playerId` parameter, you get data for ALL games but filtered to just that player:

```graphql
query PlayerInAllGames {
  playerAchievements(
    projects: [
      { project: "dopewars", namespace: "dopewars", model: "..." },
      { project: "loot-survivor", namespace: "loot_survivor", model: "..." }
    ],
    playerId: "0x1234567890abcdef..."
  ) {
    items {
      meta {
        project      # ← Tells you which game
      }
      achievements {
        playerId
        achievementId
        points       # ← Points in THIS game
      }
    }
  }
}
```

Response structure:
```json
{
  "playerAchievements": {
    "items": [
      {
        "meta": { "project": "dopewars" },
        "achievements": [
          { "playerId": "0x1234...", "achievementId": "0xabc", "points": 100 },
          { "playerId": "0x1234...", "achievementId": "0xdef", "points": 150 }
        ]
      },
      {
        "meta": { "project": "loot-survivor" },
        "achievements": [
          { "playerId": "0x1234...", "achievementId": "0x123", "points": 200 }
        ]
      }
    ]
  }
}
```

The `computePlayerStats` function processes this and creates the `gameStats` object by grouping achievements by project.

## Performance Considerations

### Fetching All Games vs Single Game

**Current implementation:**
- Fetches data for ALL games in one query
- Computes stats for all games
- Extracts specific game when needed

**Why this approach?**
- Single GraphQL query (faster than multiple queries)
- Backend query is already filtered by player (efficient)
- Computation is fast (milliseconds)
- Can show "played X out of Y games" stats

**Alternative (future optimization):**
- Could add `projectId` filter to backend
- Would only fetch data for specific game
- More complex caching strategy needed
- Marginal performance gain

### Caching Strategy

```typescript
// Cache key includes player but not specific game
cacheKey = "player_achievements:...:player:0x1234"

// Why?
// - One cache entry contains ALL games for player
// - Can serve any game-specific page from same cache
// - Reduces cache storage needs
// - Better cache hit rate
```

## Testing Examples

### Test Overall Profile

```bash
curl http://localhost:3000/player/coolgamer | grep og:description
# Expected: content="1,250 Points • 15/50 Achievements"
```

### Test Game-Specific Profile

```bash
curl http://localhost:3000/game/dopewars/player/coolgamer | grep og:description
# Expected: content="500 Points • 8/20 Achievements in dopewars"
```

### Test Non-Existent Game

```bash
curl http://localhost:3000/game/fakegame/player/coolgamer | grep og:description
# Expected: Fallback to "View coolgamer's stats in fakegame"
```

### Test Player Who Hasn't Played Game

```bash
curl http://localhost:3000/game/zkube/player/coolgamer | grep og:description
# Expected: content="0 Points • 0/25 Achievements in zkube"
```

## Helper Functions Reference

### `getGameStats(stats, gameId)`

**Purpose:** Safely extract game-specific stats

**Returns:** `GameStats | undefined`

**Example:**
```typescript
const gameStats = getGameStats(stats, "dopewars");
if (gameStats) {
  console.log(`Points: ${gameStats.points}`);
} else {
  console.log("Player hasn't played this game");
}
```

### `hasPlayedGame(stats, gameId)`

**Purpose:** Check if player has any progress in a game

**Returns:** `boolean`

**Example:**
```typescript
if (hasPlayedGame(stats, "dopewars")) {
  // Show game stats
} else {
  // Show "Start playing" message
}
```

### `formatGameStatsDescription(gameStats, gameId)`

**Purpose:** Format game stats as readable string

**Returns:** `string`

**Example:**
```typescript
const desc = formatGameStatsDescription(gameStats, "dopewars");
// Returns: "500 Points • 8/20 Achievements in dopewars"
```

## Summary

✅ **Game-specific stats are automatically computed** when you call `computePlayerStats()`

✅ **Access via `stats.gameStats[gameId]`** where gameId is the project identifier

✅ **SSR automatically handles** game-specific player pages at `/game/:gameId/player/:username`

✅ **Helper functions** make it easy to work with game stats safely

✅ **All games are fetched in one query** for efficiency

✅ **Works right now** - no additional backend changes needed!
