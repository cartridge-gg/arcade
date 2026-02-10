# Storybook

Storybook is available for component development and review.

## Local Development

```bash
pnpm --filter @cartridge/client storybook
```

## Build

```bash
pnpm --filter @cartridge/client build-storybook
```

## Vercel Deployment

The Storybook is deployed to Vercel with the following configuration:

- **Install Command:** `pnpm install --frozen-lockfile --ignore-scripts`
- **Build Command:** `pnpm --filter @cartridge/arcade build && pnpm --filter @cartridge/client build-storybook`
- **Output Directory:** `client/storybook-static`
- **Node.js Version:** 22.x
