# GraphQL Queries for Testing Cartridge API

## API Endpoint
```
https://api.cartridge.gg/query
```

## 1. Find Username by Address

Test if a username exists in the system:

```graphql
query AddressByUsername {
  account(username: "ayushtom") {
    controllers(first: 1) {
      edges {
        node {
          address
        }
      }
    }
  }
}
```

### cURL Example:
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query AddressByUsername { account(username: \"ayushtom\") { controllers(first: 1) { edges { node { address } } } } }"
  }'
```

---

## 2. Get Player Achievements (Single Game)

Fetch achievements for a specific player in one game:

```graphql
query PlayerAchievements {
  playerAchievements(
    projects: [
      { model: "", namespace: "loot_survivor", project: "loot-survivor" }
    ]
    playerId: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
  ) {
    items {
      meta {
        project
        namespace
        count
      }
      achievements {
        playerId
        achievementId
        points
        taskId
        taskTotal
        total
        completionTime
      }
    }
  }
}
```

### cURL Example:
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query PlayerAchievements { playerAchievements(projects: [{ model: \"\", namespace: \"loot_survivor\", project: \"loot-survivor\" }], playerId: \"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7\") { items { meta { project namespace count } achievements { playerId achievementId points taskId taskTotal total completionTime } } } }"
  }'
```

---

## 3. Get All Achievements for a Game

Fetch all available achievements (for calculating totals):

```graphql
query GameAchievements {
  achievements(
    projects: [
      { model: "", namespace: "loot_survivor", project: "loot-survivor" }
    ]
  ) {
    items {
      meta {
        project
        namespace
        count
      }
      achievements {
        id
        hidden
        points
        title
        description
        taskId
        taskTotal
      }
    }
  }
}
```

### cURL Example:
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GameAchievements { achievements(projects: [{ model: \"\", namespace: \"loot_survivor\", project: \"loot-survivor\" }]) { items { meta { project namespace count } achievements { id hidden points title description taskId taskTotal } } } }"
  }'
```

---

## 4. Get Player Achievements (Multiple Games)

Fetch achievements across multiple games (this is what causes timeout):

```graphql
query AllPlayerAchievements {
  playerAchievements(
    projects: [
      { model: "", namespace: "dopewars", project: "dopewars" },
      { model: "", namespace: "loot_survivor", project: "loot-survivor" },
      { model: "", namespace: "zkube", project: "zkube" }
    ]
    playerId: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
  ) {
    items {
      meta {
        project
        count
      }
      achievements {
        playerId
        achievementId
        points
        total
        taskTotal
      }
    }
  }
}
```

**Note:** Querying 11 games at once is too slow for SSR (causes 504 timeout).

---

## 5. Search for Valid Users

Find valid usernames to test with:

```graphql
query ListAccounts {
  accounts(first: 10) {
    edges {
      node {
        username
        controllers {
          edges {
            node {
              address
            }
          }
        }
      }
    }
  }
}
```

### cURL Example:
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query ListAccounts { accounts(first: 10) { edges { node { username controllers { edges { node { address } } } } } } }"
  }'
```

---

## Testing Flow

### Step 1: Find a valid username
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{"query": "query { accounts(first: 5) { edges { node { username } } } }"}'
```

### Step 2: Get their address
```bash
curl -X POST https://api.cartridge.gg/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { account(username: \"FOUND_USERNAME\") { controllers(first: 1) { edges { node { address } } } } }"
  }'
```

### Step 3: Test SSR with that username
```bash
curl -H "User-Agent: facebookexternalhit/1.1" \
  "https://arcade-git-ayush-c7e-752-profile-social-sharing.preview.cartridge.gg/player/FOUND_USERNAME"
```

---

## Available Games

```javascript
const ACTIVE_PROJECTS = [
  { namespace: "dopewars", project: "dopewars" },
  { namespace: "loot_survivor", project: "loot-survivor" },
  { namespace: "underdark", project: "underdark" },
  { namespace: "zkube", project: "zkube" },
  { namespace: "blobert", project: "blobert" },
  { namespace: "zdefender", project: "zdefender" },
  { namespace: "realm", project: "realm" },
  { namespace: "eternum", project: "eternum" },
  { namespace: "ponziland", project: "ponziland" },
  { namespace: "evolute_genesis", project: "evolute-genesis" },
  { namespace: "pistols", project: "pistols" },
];
```

---

## Performance Notes

- **Single game query**: ~200-500ms ✅
- **3 games query**: ~800ms-1.5s ⚠️
- **11 games query**: ~3-10s+ ❌ (causes timeout)

### Recommendations for Real Data:

1. **Use caching**: Store computed stats in Redis/KV with 5-minute TTL
2. **Optimize queries**: Only fetch necessary fields
3. **Lazy loading**: Fetch on-demand instead of preloading all games
4. **Background jobs**: Precompute stats periodically
5. **Single game focus**: For game-specific pages, only query that game

---

## Testing Your Implementation

Once deployed, test with:

```bash
# Game page (works - no API calls)
curl -H "User-Agent: facebookexternalhit/1.1" \
  "https://YOUR_URL/game/loot-survivor"

# Player profile (placeholder data for now)
curl -H "User-Agent: facebookexternalhit/1.1" \
  "https://YOUR_URL/player/USERNAME"

# View OG image directly
open "https://YOUR_URL/api/og?type=profile&username=test&points=1000&achievements=5/20"
```
