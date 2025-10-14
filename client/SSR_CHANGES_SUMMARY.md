# SSR Dynamic Active Projects & Completion-Based Points - Summary

## Problem
SSR was displaying incorrect achievement points because:
1. It used a hardcoded list of active projects (12 projects)
2. It counted ALL achievement progressions, not just completed ones
3. This resulted in showing 3340 points instead of the correct 2325 points for player "bal7hazar"

## Root Cause
The client calculates points differently than SSR was:
- **Client**: Only counts achievements where ALL tasks are completed (groups progressions by achievementId and checks if every task has `total >= taskTotal`)
- **Old SSR**: Summed points from ALL progressions regardless of completion status
- **Active Projects**: The client dynamically fetches active (whitelisted && published) editions from the Arcade Registry via Torii

## Solution

### 1. Dynamic Active Projects Fetching (`api/ssr.ts`)
- Added `getActiveProjects()` function that queries Torii GraphQL endpoint
- Fetches editions from: `https://api.cartridge.gg/x/arcade-main/torii/graphql`
- Filters by: `whitelisted: true` AND `published: true`
- Fetches up to 100 editions to ensure all active ones are included
- Decodes hex-encoded namespace (felt252) to ASCII
- Parses config JSON to extract project name
- Computes model hashes using starknet.js: `getSelectorFromTag(namespace, "TrophyProgression")`

### 2. Caching Mechanism
- Added 5-minute TTL cache to reduce API calls to Torii
- Falls back to stale cache if fetch fails
- Variables:
  - `cachedActiveProjects: Project[] | null`
  - `cacheTimestamp: number`
  - `CACHE_TTL = 5 * 60 * 1000` (5 minutes)

### 3. Completion-Based Points Calculation
Updated `computePlayerStats()` to match client logic:
- Groups progressions by `achievementId`
- Only counts achievements where **all tasks** are completed (`task.total >= task.taskTotal`)
- Uses the `points` value from the first task of each completed achievement

### 4. Helper Functions Added
From `src/models/index.ts`, replicated for SSR:
- `serializeByteArray()` - Serializes ByteArray to bigint array
- `computeByteArrayHash()` - Computes Poseidon hash of string
- `getSelectorFromTag()` - Computes Dojo selector from namespace and event name
- `decodeFelt252()` - Decodes hex-encoded felt252 to ASCII string

### 5. GraphQL Query Added
```graphql
query {
  arcadeEditionModels(first: 100) {
    edges {
      node {
        namespace
        config
        whitelisted
        published
        priority
      }
    }
  }
}
```

## Files Modified

### Primary Changes
- **`api/ssr.ts`**
  - Removed hardcoded `ACTIVE_PROJECTS` array
  - Added dynamic fetching with `getActiveProjects()`
  - Updated `computePlayerStats()` to only count completed achievements
  - Added starknet.js utilities for model hash computation
  - Added caching mechanism
  - Updated both profile and game-specific player routes

### Debug Logging Cleanup
- **`src/hooks/progressions.ts`** - Removed client-side debug console.logs

## Verification

### Test Results for "bal7hazar"
```
Expected: 2325 points
Actual:   2325 points ✅

Breakdown:
- arcade-dopewars:    825 points (21 completed achievements)
- arcade-eternum-s0:  760 points (16 completed achievements)
- arcade-pistols:     330 points (4 completed achievements)
- arcade-zkube-v1:    240 points (9 completed achievements)
- arcade-zkube-v2:    170 points (4 completed achievements)
```

### Active Projects Dynamically Fetched
Total: 12 active editions (whitelisted && published)
1. arcade-zkube-v2
2. arcade-eternum-s1
3. arcade-ls2
4. arcade-dragark
5. arcade-zkube-v1
6. arcade-eternum-s0
7. arcade-ls1
8. arcade-ponziland-nft
9. arcade-darkshuffle
10. arcade-blobarena
11. arcade-pistols
12. arcade-dopewars

## Benefits
1. ✅ **Accuracy**: SSR now matches client points calculation exactly
2. ✅ **Maintainability**: No need to manually update active projects list
3. ✅ **Performance**: 5-minute cache reduces API calls to Torii
4. ✅ **Consistency**: Same logic as client (completion-based counting)
5. ✅ **Resilience**: Fallback to stale cache if Torii is unavailable

## Technical Dependencies
- **starknet.js** (v8.5.4): For ByteArray and Poseidon hash operations
- **Torii GraphQL API**: For fetching active editions from Arcade Registry

## Deployment Notes
- No environment variables needed
- Works with existing Torii endpoint: `https://api.cartridge.gg/x/arcade-main/torii/graphql`
- Cache is in-memory (resets on serverless function cold start)
- No database or persistent storage required
