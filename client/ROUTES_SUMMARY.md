# SSR Routes Summary

This document summarizes all routes configured for Server-Side Rendering (SSR) with dynamic Open Graph meta tags.

## Implemented Routes

### 1. Player Profile (Overall Stats)
**Route:** `/player/:username`

**Also supports:** `/player/:username/tab/:tab`

**Data Fetched:**
- Username → Address resolution
- All player achievements across all games
- Total points, total achievements
- Per-game breakdown (stored in gameStats)

**Meta Tags Generated:**
- Title: `{username} | Cartridge Arcade`
- Description: `{totalPoints} Points • {completed}/{total} Achievements`
- Image: `https://api.cartridge.gg/og/profile?username={username}&points={points}&achievements={completed}/{total}`

**Example:**
```
URL: /player/coolgamer
Title: coolgamer | Cartridge Arcade
Description: 1,250 Points • 15/50 Achievements
```

### 2. Game-Specific Player Profile
**Route:** `/game/:gameId/player/:username`

**Data Fetched:**
- Username → Address resolution
- All player achievements (with playerId filter for efficiency)
- Extracts game-specific stats from gameStats object

**Meta Tags Generated:**
- Title: `{username} in {gameId} | Cartridge Arcade`
- Description: `{gamePoints} Points • {completed}/{total} Achievements in {gameId}`
- Image: `https://api.cartridge.gg/og/game-profile?username={username}&game={gameId}&points={points}`

**Example:**
```
URL: /game/dopewars/player/coolgamer
Title: coolgamer in dopewars | Cartridge Arcade
Description: 500 Points • 8/20 Achievements in dopewars
```

### 3. Game Page
**Route:** `/game/:gameId`

**Data Fetched:**
- None (static meta tags)

**Meta Tags Generated:**
- Title: `{gameId} - Cartridge Arcade`
- Description: `Play {gameId} on Cartridge Arcade - Discover onchain gaming`
- Image: `https://api.cartridge.gg/og/game/{gameId}`

**Example:**
```
URL: /game/dopewars
Title: dopewars - Cartridge Arcade
Description: Play dopewars on Cartridge Arcade - Discover onchain gaming
```

## Security Features

All routes include comprehensive security measures:

### Input Validation
- Username validation (max 100 chars, no XSS characters)
- Address format validation (hex only, 1-64 chars)
- Early rejection of invalid inputs

### XSS Prevention
- HTML escaping for all user-controlled content
- Safe URL construction
- Escaped meta tag values

### Performance
- 10-second timeout on all GraphQL requests
- 5-minute cache with 10-minute stale-while-revalidate
- Per-player backend filtering (95%+ data reduction)

### Error Handling
- Graceful fallback to default meta tags
- Proper address normalization with validation
- Comprehensive error logging

## Data Flow

```
User shares URL
    ↓
Social media crawler requests page
    ↓
Vercel routes to /api/ssr serverless function
    ↓
SSR function:
  1. Validates username/address format
  2. Resolves username to address (if needed)
  3. Fetches player data from GraphQL API
  4. Computes statistics
  5. Generates meta tags
  6. Returns HTML with meta tags + redirect
    ↓
Crawler parses meta tags
    ↓
Real user visits page
    ↓
JavaScript redirect to SPA
    ↓
Normal Arcade app loads
```

## Not Implemented

The following routes do NOT have SSR and use default meta tags:
- `/collection/:collection` - Collection pages (skipped per requirements)
- `/` - Home page (uses default meta tags)
- All other routes - Default meta tags

## Testing

To test SSR locally:

```bash
# Build the project
pnpm build

# Start local dev server
pnpm dev

# Test a route (simulating crawler)
curl http://localhost:3000/player/coolgamer

# Should return HTML with meta tags, not redirect
```

## Deployment

When deployed to Vercel:
1. All `/player/:username` requests → `/api/ssr` serverless function
2. All `/game/:gameId/player/:username` requests → `/api/ssr` serverless function
3. All `/game/:gameId` requests → `/api/ssr` serverless function
4. SSR function generates dynamic meta tags with real data
5. Regular browsers get redirected to SPA
6. Crawlers see meta tags for social previews

## Backend Requirements

The backend must support:
- `addressByUsername` query for username resolution
- `playerAchievements` query with optional `playerId` filter
- `achievements` query for achievement definitions

All queries are already implemented and working.
