# Arcade SDK

The Arcade SDK contains constants and a provider to ease the communication with the Cartridge World.

## Starknet v10 requirements

Arcade `0.4.0` and newer requires Node.js 22 or newer, React 19, Starknet.js `10.0.2`, and the coordinated Dojo `2.0.0`
packages. Until Starknet Start's transitive dependency ranges include Starknet.js 10, applications must pin the entire
installed graph to `10.0.2` at the package-manager root.

For npm, add:

```json
{
  "overrides": {
    "starknet": "10.0.2"
  }
}
```

For pnpm, add:

```json
{
  "pnpm": {
    "overrides": {
      "starknet": "10.0.2"
    }
  }
}
```

Install React and the marketplace query peer explicitly alongside Arcade:

```sh
pnpm add @cartridge/arcade react@^19 react-dom@^19 @tanstack/react-query@^5
```
