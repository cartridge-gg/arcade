declare module "vite-plugin-wasm" {
  const wasm: (...args: any[]) => any;
  export default wasm;
}

declare module "vite-plugin-top-level-await" {
  const topLevelAwait: (...args: any[]) => any;
  export default topLevelAwait;
}
