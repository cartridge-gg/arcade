# Social Sharing Implementation

This document describes the social sharing functionality implemented for Cartridge Arcade, enabling dynamic Open Graph (OG) images and meta tags for profiles, games, and achievements.

## Overview

The implementation provides:
- Dynamic OG image generation for profiles, games, and achievements
- Server-side rendered meta tags for social media crawlers
- Automatic detection of social media bots (Facebook, Twitter, LinkedIn, etc.)
- Cached responses for performance

## Architecture

### Components

1. **OG Image Templates** (`lib/og-templates/`)
   - `profile.tsx` - Profile card design
   - `game.tsx` - Game preview card
   - `achievement.tsx` - Achievement badge design

2. **Data Fetchers** (`lib/server-data/`)
   - `fetchProfile.ts` - Retrieves player profile data
   - `fetchGame.ts` - Retrieves game metadata
   - `fetchAchievement.ts` - Retrieves achievement details

3. **API Endpoints** (`api/og/`)
   - `/api/og/profile/[username].png` - Generates profile OG images
   - `/api/og/game/[gameId].png` - Generates game OG images
   - `/api/og/achievement/[achievementId].png` - Generates achievement OG images

4. **Middleware** (`middleware.ts`)
   - Detects social media crawlers
   - Serves HTML with proper meta tags
   - Passes regular users to the React app

## Usage

### Profile Sharing

When sharing a profile URL like `https://play.cartridge.gg/player/alice`:
- OG Image: Shows username, avatar, achievements, games played, and total points
- Meta Description: "alice has earned 42 achievements across 8 games. Total points: 15230."

### Game Sharing

When sharing a game URL like `https://play.cartridge.gg/game/eternal-quest`:
- OG Image: Shows game thumbnail, name, description, player count, and achievements
- Meta Description: Full game description with category tags

### Achievement Sharing

When sharing an achievement URL with player context:
- OG Image: Shows achievement icon, title, game name, points, and completion status
- Meta Description: Achievement description with difficulty indicator

## Configuration

### Updating Data Sources

Currently using mock data. To connect to real APIs, update the following files:

1. **Profile Data** (`lib/server-data/fetchProfile.ts`)
```typescript
// Replace mock data with actual API call
const response = await fetch(`${API_URL}/api/players/${username}`);
const data = await response.json();
```

2. **Game Data** (`lib/server-data/fetchGame.ts`)
```typescript
// Replace mock data with actual API call
const response = await fetch(`${API_URL}/api/games/${gameId}`);
const data = await response.json();
```

3. **Achievement Data** (`lib/server-data/fetchAchievement.ts`)
```typescript
// Replace mock data with actual API call
const response = await fetch(`${API_URL}/api/achievements/${achievementId}`);
const data = await response.json();
```

### Customizing OG Images

Edit the template files in `lib/og-templates/` to change:
- Colors and branding
- Layout and typography
- Data displayed
- Image dimensions (default: 1200x630)

### Cache Configuration

OG images are cached for 24 hours by default. Modify cache headers in the API endpoints:
```typescript
"Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400"
```

## Testing

### Local Testing

**Note**: The OG image generation requires Vercel Edge Runtime, which doesn't run locally with `pnpm dev`. You'll need to deploy to Vercel to test the full functionality.

For local development:
1. Deploy to Vercel preview branch
2. Run the test script against the preview URL:
```bash
VERCEL_URL=your-preview-url.vercel.app node test-og.cjs
```

3. Test with curl using social media user agents:
```bash
curl -H "User-Agent: facebookexternalhit/1.1" http://localhost:3000/player/testuser
```

### Social Media Validators

After deployment, test with official validators:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

## Deployment

The implementation uses Vercel Edge Functions for optimal performance:

1. **Vercel Configuration** (`vercel.json`)
   - Edge runtime configured for OG endpoints
   - Proper routing for API functions

2. **Middleware** runs at the edge
   - Minimal latency for crawler detection
   - Fast meta tag generation

## Performance Considerations

- **Edge Functions**: Run close to users for low latency
- **Caching**: 24-hour cache for OG images
- **Selective Processing**: Only processes requests from social media crawlers
- **Image Generation**: Uses @vercel/og for efficient image generation

## Troubleshooting

### OG Images Not Showing

1. Check if the API endpoint is accessible:
```bash
curl https://your-domain.com/api/og/profile/username.png
```

2. Verify middleware is detecting crawlers:
```bash
curl -H "User-Agent: facebookexternalhit/1.1" https://your-domain.com/player/username | grep og:image
```

3. Clear social media cache:
   - Facebook: Use the Sharing Debugger "Scrape Again" button
   - Twitter: Cards update automatically after ~7 days
   - LinkedIn: Use Post Inspector to refresh

### Meta Tags Not Updating

1. Check cache headers in responses
2. Ensure data fetchers are returning fresh data
3. Verify middleware is running (check Vercel logs)

## Future Enhancements

- [ ] Add real-time data from GraphQL API
- [ ] Implement A/B testing for OG image designs
- [ ] Add analytics tracking for social shares
- [ ] Support for additional social platforms
- [ ] Localization support for meta descriptions
- [ ] Dynamic font loading for custom typography

## Support

For issues or questions about the social sharing implementation:
1. Check this documentation
2. Review test results from `test-og.js`
3. Contact the development team

---

Implementation completed for Linear issue C7E-752: Profile Social Sharing