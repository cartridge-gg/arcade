import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "arcade-packed-consumers-"));

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(" ")} failed`);
  }

  return result;
};

const collectVersions = (value, versions = []) => {
  if (!value || typeof value !== "object") return versions;
  if (value.name === "starknet" && typeof value.version === "string") {
    versions.push(value.version);
  }
  for (const [name, child] of Object.entries(value)) {
    if (name === "starknet" && child && typeof child === "object" && typeof child.version === "string") {
      versions.push(child.version);
    }
    collectVersions(child, versions);
  }
  return versions;
};

const verifier = `
  import assert from "node:assert/strict";
  import { createRequire } from "node:module";
  import { readFileSync } from "node:fs";
  import path from "node:path";

  const require = createRequire(import.meta.url);
  const findPackage = (entry, expectedName) => {
    let directory = path.dirname(entry);
    while (directory !== path.dirname(directory)) {
      try {
        const candidate = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
        if (candidate.name === expectedName) return { directory, package: candidate };
      } catch {}
      directory = path.dirname(directory);
    }
    throw new Error(\`Unable to locate \${expectedName} from \${entry}\`);
  };

  const arcade = findPackage(require.resolve("@cartridge/arcade"), "@cartridge/arcade");
  const findDependency = (start, expectedName) => {
    let directory = start;
    while (directory !== path.dirname(directory)) {
      const packagePath = path.join(directory, "node_modules", expectedName, "package.json");
      try {
        const candidate = JSON.parse(readFileSync(packagePath, "utf8"));
        if (candidate.name === expectedName) return candidate;
      } catch {}
      directory = path.dirname(directory);
    }
    throw new Error(\`Unable to resolve \${expectedName} from \${start}\`);
  };
  const expected = {
    "@dojoengine/core": "2.0.0",
    "@dojoengine/grpc": "2.0.0",
    "@dojoengine/sdk": "2.0.0",
    "@dojoengine/torii-client": "1.8.2",
    "@dojoengine/torii-wasm": "1.8.2",
    "@starknet-io/types-js": "0.10.2",
    "starknet": "10.0.2",
  };

  assert.deepEqual(
    Object.fromEntries(Object.keys(expected).map((name) => [name, arcade.package.dependencies[name]])),
    expected,
  );
  assert.equal(arcade.package.engines.node, ">=22");
  for (const [name, version] of Object.entries(expected)) {
    const installed = findDependency(arcade.directory, name);
    assert.equal(installed.version, version, \`\${name} resolved to \${installed.version}\`);
  }

  const root = await import("@cartridge/arcade");
  const edge = await import("@cartridge/arcade/marketplace/edge");
  const react = await import("@cartridge/arcade/marketplace/react");
  assert.equal(typeof root.getMarketplacePolicies, "function");
  assert.equal(typeof edge.createEdgeMarketplaceClient, "function");
  assert.equal(typeof react.MarketplaceClientProvider, "function");
  assert.equal(findDependency(arcade.directory, "react").version.split(".")[0], "19");
  assert.equal(findDependency(arcade.directory, "react-dom").version.split(".")[0], "19");
  assert.ok(findDependency(arcade.directory, "@tanstack/react-query").version.startsWith("5."));
`;

try {
  run("pnpm", ["pack", "--pack-destination", temporaryDirectory], packageDirectory);
  const tarballName = (await readdir(temporaryDirectory)).find((file) => file.endsWith(".tgz"));
  assert.ok(tarballName, "pnpm pack did not create a tarball");
  const tarball = path.join(temporaryDirectory, tarballName);

  for (const manager of ["npm", "pnpm", "bun"]) {
    const consumer = path.join(temporaryDirectory, manager);
    await mkdir(consumer);
    await writeFile(
      path.join(consumer, "package.json"),
      JSON.stringify({
        private: true,
        dependencies: {
          "@tanstack/react-query": "5.90.2",
          react: "19.2.0",
          "react-dom": "19.2.0",
        },
        overrides: { starknet: "10.0.2" },
        pnpm: { overrides: { starknet: "10.0.2" } },
      }),
    );

    const args =
      manager === "npm"
        ? ["install", tarball, "--ignore-scripts", "--no-audit", "--no-fund"]
        : ["add", tarball, "--ignore-scripts"];
    run(manager, args, consumer);
    // Arcade supports Node >=22 at runtime. Bun 1.3.5 cannot initialize Torii
    // WASM 1.8.2 (`wasm.__wbindgen_start` is missing), so Bun is validated as
    // a package manager while imports run on the package's supported runtime.
    run("node", ["--input-type=module", "--eval", verifier], consumer);

    let starknetVersions;
    if (manager === "bun") {
      const tree = run("bun", ["pm", "ls", "--all"], consumer).stdout;
      starknetVersions = [
        ...new Set([...tree.matchAll(/(?:^|\s)starknet@(\d+\.\d+\.\d+)/gm)].map((match) => match[1])),
      ];
    } else {
      const listArgs =
        manager === "npm" ? ["ls", "starknet", "--all", "--json"] : ["list", "starknet", "--depth=Infinity", "--json"];
      const dependencyTree = JSON.parse(run(manager, listArgs, consumer).stdout);
      starknetVersions = [...new Set(collectVersions(dependencyTree))];
    }
    assert.ok(starknetVersions.length > 0, `${manager} found no Starknet package`);
    assert.deepEqual(starknetVersions, ["10.0.2"], `${manager} installed an unexpected Starknet graph`);
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

console.log("Packed npm, pnpm, and Bun consumers passed");
